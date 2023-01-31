import { exec as execSync } from 'child_process'
import { promisify } from 'util'
import { DateConverter } from './date-converter'

const exec = promisify(execSync)

export class SystemTimeInteractor {
  private static isWindows(): boolean {
    return process.platform === 'win32'
  }

  static async getSystemTimeInIso8601Format(): Promise<string> {
    if (this.isWindows()) {
      // timedatectl command does not exist on Windows machines.
      return Promise.resolve('')
    }
    const { stdout, stderr } = await exec('timedatectl show | grep "^TimeUSec"')
    if (stderr) {
      throw new Error(stderr)
    }
    const line = stdout.trim()
    const lineParts = line.split('=')
    const time = lineParts[1]
    const isoTime = DateConverter.convertTimedatectlFormatToIso(time)
    return isoTime
  }

  static async setSystemTimeInIso8601Format(
    systemTime: string,
    isRaspberryPi: boolean,
  ): Promise<void> {
    if (this.isWindows()) {
      // timedatectl command does not exist on Windows machines.
      return Promise.resolve()
    }
    const systemTimeTransformed =
      DateConverter.convertIsoToYMDHMSFormat(systemTime)
    const { stderr } = await exec(
      `sudo timedatectl set-time "${systemTimeTransformed}"`,
    )
    if (stderr) {
      throw new Error(stderr)
    }
    if (isRaspberryPi) {
      const currentWorkingDirectory = process.cwd()
      const { stderr } = await exec(
        `sudo ${currentWorkingDirectory}/scripts/raspberry-pi-write-system-time-to-rtc.sh`,
      )
      if (stderr) {
        throw new Error(stderr)
      }
    }
  }

  static async getTimeZone(): Promise<string> {
    if (this.isWindows()) {
      // timedatectl command does not exist on Windows machines.
      return Promise.resolve('')
    }
    const { stdout, stderr } = await exec('timedatectl show | grep "^Timezone"')
    if (stderr) {
      throw new Error(stderr)
    }
    const line = stdout.trim()
    const lineParts = line.split('=')
    const timeZone = lineParts[1]
    return timeZone
  }

  static async setTimeZone(timeZone: string): Promise<void> {
    if (this.isWindows()) {
      // timedatectl command does not exist on Windows machines.
      return Promise.resolve()
    }
    const { stderr } = await exec(`sudo timedatectl set-timezone "${timeZone}"`)
    if (stderr) {
      throw new Error(stderr)
    }
  }
}
