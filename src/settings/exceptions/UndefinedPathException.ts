// © 2023-2024 Luxembourg Institute of Science and Technology
export class UndefinedPathException extends Error {
  constructor(message = '') {
    super(message)
    this.name = 'CommandUnavailableOnWindowsException'
  }
}
