// © 2024 Luxembourg Institute of Science and Technology
export class UnknownMimeTypeException extends Error {
  constructor(message: string) {
    super(message)
    this.name = UnknownMimeTypeException.name
  }
}
