// © 2024 Luxembourg Institute of Science and Technology
import { CommandExecutionException } from './CommandExecutionException'

describe(CommandExecutionException.name, () => {
  it(`should be an instance of '${CommandExecutionException.name}'`, () => {
    try {
      throw new CommandExecutionException('a')
    } catch (e) {
      expect(e).toBeInstanceOf(CommandExecutionException)
    }
  })
})
