// © 2024 Luxembourg Institute of Science and Technology
import { FocusValueOutOfRange } from './FocusValueOutOfRange'

describe(FocusValueOutOfRange.name, () => {
  it(`should be an instance of '${FocusValueOutOfRange.name}'`, () => {
    try {
      throw new FocusValueOutOfRange('a')
    } catch (e) {
      expect(e).toBeInstanceOf(FocusValueOutOfRange)
    }
  })
})
