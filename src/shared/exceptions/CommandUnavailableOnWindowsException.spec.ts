// © 2024 Luxembourg Institute of Science and Technology
import { CommandUnavailableOnWindowsException } from './CommandUnavailableOnWindowsException'

describe(CommandUnavailableOnWindowsException.name, () => {
  it(`should be an instance of '${CommandUnavailableOnWindowsException.name}'`, () => {
    try {
      throw new CommandUnavailableOnWindowsException()
    } catch (e) {
      expect(e).toBeInstanceOf(CommandUnavailableOnWindowsException)
    }
  })
})
