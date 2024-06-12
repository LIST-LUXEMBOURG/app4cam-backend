import { exec as execSync } from 'child_process'
import { promisify } from 'util'
import { CommandUnavailableOnWindowsException } from '../exceptions/CommandUnavailableOnWindowsException'

const exec = promisify(execSync)

export class TemperatureInteractor {
  private static throwExceptionIfOnWindows(): void {
    if (process.platform === 'win32') {
      throw new CommandUnavailableOnWindowsException()
    }
  }

  static async getCurrentTemperature(): Promise<number> {
    this.throwExceptionIfOnWindows()
    const currentWorkingDirectory = process.cwd()
    const { stdout, stderr } = await exec(
      `${currentWorkingDirectory}/scripts/raspberry-pi/air-temperature/read_air_temp`,
    )
    if (stderr) {
      throw new Error(stderr)
    }
    const line = stdout.trim()
    const value = parseFloat(line)
    return value
  }
}
