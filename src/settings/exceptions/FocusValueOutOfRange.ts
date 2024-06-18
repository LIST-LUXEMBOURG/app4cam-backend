// © 2024 Luxembourg Institute of Science and Technology
export class FocusValueOutOfRange extends Error {
  constructor(message: string) {
    super(message)
    this.name = FocusValueOutOfRange.name
  }
}
