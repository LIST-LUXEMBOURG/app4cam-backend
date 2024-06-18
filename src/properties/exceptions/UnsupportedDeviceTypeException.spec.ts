// © 2024 Luxembourg Institute of Science and Technology
import { UnsupportedDeviceTypeException } from './UnsupportedDeviceTypeException'

describe(UnsupportedDeviceTypeException.name, () => {
  it(`should be an instance of '${UnsupportedDeviceTypeException.name}'`, () => {
    try {
      throw new UnsupportedDeviceTypeException('a')
    } catch (e) {
      expect(e).toBeInstanceOf(UnsupportedDeviceTypeException)
    }
  })
})
