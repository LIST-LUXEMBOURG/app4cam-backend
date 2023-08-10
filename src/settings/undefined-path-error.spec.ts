import { UndefinedPathError } from './undefined-path-error'

describe(UndefinedPathError.name, () => {
  it(`should be an instance of '${UndefinedPathError.name}'`, () => {
    try {
      throw new UndefinedPathError()
    } catch (e) {
      expect(e).toBeInstanceOf(UndefinedPathError)
    }
  })
})
