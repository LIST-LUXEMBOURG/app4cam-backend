// © 2024 Luxembourg Institute of Science and Technology
import { exec as execSync } from 'child_process'
import { promisify } from 'util'
import { CommandExecutionException } from '../../shared/exceptions/CommandExecutionException'
import { CommandUnavailableOnWindowsException } from '../../shared/exceptions/CommandUnavailableOnWindowsException'

const exec = promisify(execSync)

export class TemperatureInteractor {
  static async getCurrentTemperature(): Promise<number> {
    CommandUnavailableOnWindowsException.throwIfOnWindows()
    const currentWorkingDirectory = process.cwd()
    const { stdout, stderr } = await exec(
      `${currentWorkingDirectory}/scripts/raspberry-pi/air-temperature/read_air_temp`,
    )
    if (stderr) {
      throw new CommandExecutionException(stderr)
    }
    const line = stdout.trim()
    const value = parseFloat(line)
    return value
  }
}
