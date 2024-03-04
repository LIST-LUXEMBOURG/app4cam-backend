// © 2023-2024 Luxembourg Institute of Science and Technology
import { UndefinedPathException } from './UndefinedPathException'

describe(UndefinedPathException.name, () => {
  it(`should be an instance of '${UndefinedPathException.name}'`, () => {
    try {
      throw new UndefinedPathException()
    } catch (e) {
      expect(e).toBeInstanceOf(UndefinedPathException)
    }
  })
})
