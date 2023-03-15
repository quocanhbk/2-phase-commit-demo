/**
 * @dev This is a demo of Two Phase Commit protocol.
 * @author quocanhbk17
 */

import Logger from "./logger"

import yargs from "yargs"

const caseValue = yargs.argv["case"] ? parseInt(yargs.argv["case"]) : undefined

const tweakPrepareAndCommitProbability = (caseValue: number | undefined) => {
  switch (caseValue) {
    case 1:
      return {
        prepareProbability: 0.999,
        commitProbability: 0.999,
      }
    case 2:
      return {
        prepareProbability: 0.1,
        commitProbability: 0.999,
      }
    case 3:
      return {
        prepareProbability: 0.999,
        commitProbability: 0.1,
      }
    default:
      return {
        prepareProbability: 0.8,
        commitProbability: 0.8,
      }
  }
}

const { prepareProbability, commitProbability } = tweakPrepareAndCommitProbability(caseValue)

// Define a Transaction interface
interface Transaction {
  id: string
}

// Define a Node interface
class DBNode {
  public id: string
  public state: "INIT" | "PREPARED" | "COMMITTED" | "ABORTED"
  public logger: Logger

  constructor(id: string) {
    this.id = id
    this.state = "INIT"
    this.logger = new Logger(`NODE ${id}`)
  }

  public async prepareTransaction(transaction: Transaction): Promise<boolean> {
    this.logger.log(`Preparing transaction ${transaction.id}`)
    await new Promise(resolve =>
      setTimeout(() => {
        const rand = Math.random()
        if (rand < prepareProbability) {
          this.state = "PREPARED"
        } else {
          this.state = "ABORTED"
        }
        resolve(true)
      }, 1000)
    )

    if (this.state === "ABORTED") {
      this.logger.error(`Node ${this.id} is not ready to commit transaction ${transaction.id}`)
      return false
    }

    this.logger.log(`Node ${this.id} is ready to commit transaction ${transaction.id}`)
    return true
  }

  public async commitTransaction(transaction: Transaction): Promise<boolean> {
    this.logger.log(`Committing transaction ${transaction.id}`)
    await new Promise(resolve =>
      setTimeout(() => {
        const rand = Math.random()
        if (rand < commitProbability) {
          this.state = "COMMITTED"
        } else {
          this.state = "ABORTED"
        }
        resolve(true)
      }, 1000)
    )

    if (this.state === "ABORTED") {
      this.logger.error(`Node ${this.id} failed to commit transaction ${transaction.id}`)
      return false
    }

    this.logger.log(`Node ${this.id} committed transaction ${transaction.id} successfully`)
    return true
  }

  public async rollbackTransaction(transaction: Transaction): Promise<boolean> {
    // If the node is not committed, we don't need to rollback
    if (this.state !== "COMMITTED") {
      return true
    }

    this.logger.log(`Rolling back transaction ${transaction.id}`)
    await new Promise(resolve =>
      setTimeout(() => {
        this.state = "ABORTED"
        resolve(true)
      }, 1000)
    )

    return true
  }
}

// Define a Coordinator class
class Coordinator {
  private nodes: DBNode[] = []
  private logger: Logger

  constructor(nodes: DBNode[]) {
    this.nodes = nodes
    this.logger = new Logger("COORDINATOR")
  }

  // Method to add a new node to the coordinator
  public addNode(node: DBNode): void {
    this.nodes.push(node)
  }

  // Method to prepare a transaction
  private async prepareTransaction(transaction: Transaction): Promise<boolean> {
    // Loop through all nodes and prepare the transaction
    this.logger.log(`Sending prepare request to all nodes...`)
    let allPrepared = true
    for (const node of this.nodes) {
      const result = await node.prepareTransaction(transaction)
      if (!result) {
        allPrepared = false
        // Abort the transaction if one of the nodes failed to prepare
        break
      }
    }

    return allPrepared
  }

  private async commitTransaction(transaction: Transaction): Promise<boolean> {
    // Loop through all nodes and commit the transaction
    this.logger.log(`Sending commit request to all nodes...`)
    let allCommitted = true
    for (const node of this.nodes) {
      const result = await node.commitTransaction(transaction)
      if (!result) {
        allCommitted = false
        // Abort the transaction if one of the nodes failed to commit
        break
      }
    }

    return allCommitted
  }

  public async beginTwoPhaseCommit(transaction: Transaction): Promise<boolean> {
    const allPrepared = await this.prepareTransaction(transaction)

    if (!allPrepared) {
      this.logger.error(`One or more nodes failed to prepare transaction ${transaction.id}. Transaction aborted`)
      return false
    }

    const allCommitted = await this.commitTransaction(transaction)

    if (!allCommitted) {
      this.logger.error(`One or more nodes failed to commit transaction ${transaction.id}. Rolling back...`)

      // Rollback the transaction
      for (const node of this.nodes) {
        await node.rollbackTransaction(transaction)
      }
    }

    if (allCommitted) {
      this.logger.log(`Transaction ${transaction.id} committed successfully`)
    } else {
      this.logger.error(`Transaction ${transaction.id} failed to commit`)
    }
  }
}

async function main() {
  const node1 = new DBNode("1")
  const node2 = new DBNode("2")

  const coordinator = new Coordinator([node1, node2])

  const transaction1: Transaction = {
    id: "T1",
  }

  coordinator.beginTwoPhaseCommit(transaction1)
}

main()
