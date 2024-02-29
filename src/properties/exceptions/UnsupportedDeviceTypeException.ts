// © 2024 Luxembourg Institute of Science and Technology
export class UnsupportedDeviceTypeException extends Error {
  constructor(type: string) {
    super(type)
    this.name = 'UnsupportedDeviceTypeException'
  }
}
