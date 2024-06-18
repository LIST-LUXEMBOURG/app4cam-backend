// © 2023-2024 Luxembourg Institute of Science and Technology
import { exec as execSync } from 'child_process'
import { promisify } from 'util'
import { CommandExecutionException } from '../../shared/exceptions/CommandExecutionException'
import { CommandUnavailableOnWindowsException } from '../../shared/exceptions/CommandUnavailableOnWindowsException'

const exec = promisify(execSync)

export class SystemTimeZonesInteractor {
  static async getAvailableTimeZones(): Promise<string[]> {
    CommandUnavailableOnWindowsException.throwIfOnWindows()
    const { stdout, stderr } = await exec('timedatectl list-timezones')
    if (stderr) {
      throw new CommandExecutionException(stderr)
    }
    const timeZones = stdout.trimEnd().split('\n')
    return timeZones
  }
}
