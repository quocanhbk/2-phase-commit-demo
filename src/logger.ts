import chalk from "chalk"

class Logger {
  private readonly context: string

  constructor(context: string) {
    this.context = context
  }

  public error(message: string): void {
    console.log(chalk.red(`[${this.context}] ${message}`))
  }

  public info(message: string): void {
    console.log(chalk.cyan(`[${this.context}] ${message}`))
  }

  public warn(message: string): void {
    console.log(chalk.hex("#FFFF00")(`[${this.context}] ${message}`))
  }

  public log(message: string): void {
    console.log(chalk.green(`[${this.context}] ${message}`))
  }
}

export default Logger
