// © 2023-2024 Luxembourg Institute of Science and Technology
import { exec as execSync } from 'child_process'
import { promisify } from 'util'
import { CommandUnavailableOnWindowsException } from '../exceptions/CommandUnavailableOnWindowsException'

const exec = promisify(execSync)

export class SystemTimeZonesInteractor {
  private static isWindows(): boolean {
    return process.platform === 'win32'
  }

  static async getAvailableTimeZones(): Promise<string[]> {
    if (process.platform === 'win32') {
      throw new CommandUnavailableOnWindowsException()
    }
    const { stdout, stderr } = await exec('timedatectl list-timezones')
    if (stderr) {
      throw new Error(stderr)
    }
    const timeZones = stdout.trimEnd().split('\n')
    return timeZones
  }
}
