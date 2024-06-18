// © 2024 Luxembourg Institute of Science and Technology
export class CommandExecutionException extends Error {
  constructor(message: string) {
    super(message)
    this.name = CommandExecutionException.name
  }
}
