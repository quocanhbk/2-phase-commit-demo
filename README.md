# Distributed Systems - Two Phase Commit Protocol

> _Disclaimer: This demo is intended only for educational and demonstration purposes. It is not meant for practical use and has not been tested for production environments_

## Definition

The two-phase commit protocol (2PC) is a distributed algorithm used to ensure that all nodes in a distributed database system commit a transaction atomically. In a distributed database, data is spread across multiple nodes, and transactions may involve updating data on multiple nodes. The 2PC protocol helps to ensure that transactions involving multiple nodes are completed consistently, so that the system remains in a consistent state.

In the 2PC protocol, a coordinator node is responsible for managing the transaction. The coordinator sends a "prepare" message to all nodes involved in the transaction, asking them to prepare to commit the transaction. Each node then locks the data that it needs to update and ensures that it can successfully commit the transaction.

If all nodes are able to prepare successfully, the coordinator sends a "commit" message to all nodes. Each node then commits the transaction and releases its locks. If any node is unable to prepare or commit, the coordinator sends an "abort" message to all nodes, and the transaction is rolled back.

The two-phase commit protocol is important for maintaining data consistency in a distributed database system. However, it can also be a performance bottleneck, as it can require a lot of communication between nodes and can result in delays if any node fails to respond. As a result, alternative protocols such as three-phase commit (3PC) have been developed to address some of these issues.

<br/>

## What does each node do in the **PREPARE** phase?

**1. Locks the data:** The node acquires locks on the data that it needs to update to ensure that no other transaction can modify the same data.

**2. Validates the transaction:** The node validates the transaction to ensure that it can be committed without violating any constraints or rules. If the transaction cannot be validated, the node will send an "abort" message to the coordinator.

**3. Logs the transaction:** The node logs the transaction information in its local transaction log. This log is used to recover the state of the transaction in case of a failure.

**4. Acknowledges the prepare request:** If the node is able to prepare successfully, it sends an acknowledgement message to the coordinator indicating that it is ready to commit the transaction.

**5. Waits for the coordinator:** The node waits for the coordinator to send a "commit" or "abort" message. If the node does not receive a message within a specified timeout period, it assumes that the coordinator has failed and takes appropriate action, such as aborting the transaction.

<br/>

## What does each node do in the **COMMIT** phase?

**1. Commits the transaction:** The node commits the transaction by updating the data and releasing the locks on the data that it holds. This ensures that the changes made by the transaction become permanent and visible to other transactions.

**2. Logs the commit:** The node logs the commit information in its local transaction log. This log is used to recover the state of the transaction in case of a failure.

**3. Acknowledges the commit:** If the node is able to commit successfully, it sends an acknowledgement message to the coordinator indicating that it has committed the transaction.

**4. Releases resources:** The node releases any resources that it held for the transaction, such as memory or file handles.

**5. Notifies other nodes:** If the node holds any locks on data that other nodes need to access, it notifies those nodes that the locks have been released.

<br/>

## What does each node do when it receives an **ABORT** message?

**1. Rollbacks the transaction:** The node rolls back the transaction by undoing any updates that were made by the transaction and releasing the locks on the data that it holds. This ensures that the database is returned to the state it was in before the transaction began.

**2. Logs the abort:** The node logs the abort information in its local transaction log. This log is used to recover the state of the transaction in case of a failure.

**3. Acknowledges the abort:** If the node is able to abort successfully, it sends an acknowledgement message to the coordinator indicating that it has aborted the transaction.

**4. Releases resources:** The node releases any resources that it held for the transaction, such as memory or file handles.

**5. Notifies other nodes:** If the node holds any locks on data that other nodes need to access, it notifies those nodes that the locks have been released.

<br/>

## What will committed nodes do when receive **ABORT** message?

When a committed node receives an abort message in a two-phase commit protocol, it must undo the changes made by the transaction and roll back to the previous state of the database.

This is necessary to ensure that the database remains in a consistent state, as all nodes involved in the transaction must agree on the final outcome. If a node has committed the transaction but then receives an abort message, it must roll back to the previous state to ensure that it is consistent with the other nodes in the system.

The rollback process typically involves undoing the changes made by the transaction and restoring the database to its previous state. This may involve undoing changes made to multiple tables or records, depending on the complexity of the transaction.

In some cases, rolling back a committed transaction may result in data inconsistencies or conflicts with other transactions that have been executed since the original transaction. In such cases, it may be necessary to perform additional corrective actions to resolve the conflicts and restore the database to a consistent state.

Overall, it is important to ensure that all nodes involved in a distributed transaction agree on the final outcome to ensure that the database remains consistent and that data integrity is maintained.

<br/>

## To run the demo

- Install Yarn by following the installation instructions on the [Yarn website](https://classic.yarnpkg.com/en/docs/install).

- Install dependencies by running the following command in the terminal:

```bash
yarn install
```

- Once the dependencies are installed, run the code using the following command:

```bash
yarn start
```

- This will start the program and execute the code.

### There will be 3 common cases that will happen in the demo.

- Case 1: All nodes are able to prepare successfully and commit the transaction.
- Case 2: One or more nodes fail to prepare the transaction. The transaction is aborted.
- Case 3: One or more nodes fail to commit the transaction. The transaction is aborted and rolled back.

You can pass in the following arguments to the program to change the behavior of the demo:

- `--case`: The case number to run. The default value is 1.

Based on the case number, the code will tweak the behavior of the nodes to simulate the failure of one or more nodes. For example, if you pass in `--case 2`, the code will simulate a failure in the prepare phase by causing one of the nodes to fail to prepare the transaction.

<br/>

## Demo Console Output

**When a transaction is committed successfully**

```bash
[COORDINATOR] Sending prepare request to all nodes...
[NODE 1] Preparing transaction T1
[NODE 1] Node 1 is ready to commit transaction T1
[NODE 2] Preparing transaction T1
[NODE 2] Node 2 is ready to commit transaction T1
[COORDINATOR] Sending commit request to all nodes...
[NODE 1] Committing transaction T1
[NODE 1] Node 1 committed transaction T1 successfully
[NODE 2] Committing transaction T1
[NODE 2] Node 2 committed transaction T1 successfully
[COORDINATOR] Transaction T1 committed successfully
```

**When a transaction is aborted due to NODE 2 failure to prepare**

```bash
[COORDINATOR] Sending prepare request to all nodes...
[NODE 1] Preparing transaction T1
[NODE 1] Node 1 is ready to commit transaction T1
[NODE 2] Preparing transaction T1
[NODE 2] Node 2 is not ready to commit transaction T1
[COORDINATOR] One or more nodes failed to prepare transaction T1. Transaction aborted.
```

**When a transaction is aborted and rolled back due to NODE 2 failure to commit**

```bash
[COORDINATOR] Sending prepare request to all nodes...
[NODE 1] Preparing transaction T1
[NODE 1] Node 1 is ready to commit transaction T1
[NODE 2] Preparing transaction T1
[NODE 2] Node 2 is ready to commit transaction T1
[COORDINATOR] Sending commit request to all nodes...
[NODE 1] Committing transaction T1
[NODE 1] Node 1 committed transaction T1 successfully
[NODE 2] Committing transaction T1
[NODE 2] Node 2 failed to commit transaction T1
[COORDINATOR] One or more nodes failed to commit transaction T1. Rolling back...
[NODE 1] Rolling back transaction T1
[COORDINATOR] Transaction T1 failed to commit
```

<br/>

## Extend this demo

To extend this demo, you can:

- Add more nodes to the system to observe how transactions are handled when multiple nodes are involved.
- Interact with real databases to test the system's functionality in a practical setting.
- Implement multiple coordinators to improve the system's performance and scalability.
