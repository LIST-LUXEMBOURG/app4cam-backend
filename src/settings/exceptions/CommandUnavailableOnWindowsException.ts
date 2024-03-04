// © 2024 Luxembourg Institute of Science and Technology
export class CommandUnavailableOnWindowsException extends Error {
  constructor() {
    super()
    this.name = 'CommandUnavailableOnWindowsException'
  }
}
