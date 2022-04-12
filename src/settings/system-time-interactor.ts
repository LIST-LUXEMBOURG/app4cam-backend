import { exec as execSync } from 'child_process'
import { promisify } from 'util'

const exec = promisify(execSync)

export class SystemTimeInteractor {
  private static isWindows(): boolean {
    return process.platform === 'win32'
  }

  static async getSystemTimeInIso8601Format(): Promise<string> {
    if (this.isWindows()) {
      // /bin/date command does not exist on Windows machines.
      return Promise.resolve('')
    }
    const { stdout, stderr } = await exec('/bin/date --iso-8601=seconds')
    if (stderr) {
      throw new Error(stderr)
    }
    const time = stdout.trimEnd()
    return time
  }

  static async setSystemTimeInIso8601Format(systemTime: string): Promise<void> {
    if (this.isWindows()) {
      // /bin/date command does not exist on Windows machines.
      return Promise.resolve()
    }
    const currentWorkingDirectory = process.cwd()
    const { stderr } = await exec(
      `sudo /bin/date --set="${systemTime}" | sudo ${currentWorkingDirectory}/scripts/system_to_rtc.sh`,
    )
    if (stderr) {
      throw new Error(stderr)
    }
  }

  static async getAvailableTimeZones(): Promise<string[]> {
    if (this.isWindows()) {
      // timedatectl command does not exist on Windows machines.
      return Promise.resolve(['', ''])
    }
    const { stdout, stderr } = await exec('timedatectl list-timezones')
    if (stderr) {
      throw new Error(stderr)
    }
    const timeZones = stdout.trimEnd().split('\n')
    return timeZones
  }

  static async getTimeZone(): Promise<string> {
    if (this.isWindows()) {
      // timedatectl command does not exist on Windows machines.
      return Promise.resolve('')
    }
    const { stdout, stderr } = await exec('timedatectl')
    if (stderr) {
      throw new Error(stderr)
    }
    const lines = stdout.trimEnd().split('\n')
    const timeZoneLine = lines.find((l) => l.includes('Time zone:'))
    const parts = timeZoneLine.trim().split(/\s+/)
    const timeZone = parts[2]
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
