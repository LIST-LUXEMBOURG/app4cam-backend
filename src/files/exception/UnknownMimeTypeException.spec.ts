// © 2023-2024 Luxembourg Institute of Science and Technology
import { UnknownMimeTypeException } from './UnknownMimeTypeException'

describe(UnknownMimeTypeException.name, () => {
  it(`should be an instance of '${UnknownMimeTypeException.name}'`, () => {
    try {
      throw new UnknownMimeTypeException('a')
    } catch (e) {
      expect(e).toBeInstanceOf(UnknownMimeTypeException)
    }
  })
})
