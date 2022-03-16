import { exec as execSync } from 'child_process'
import { promisify } from 'util'

const exec = promisify(execSync)

export class SystemTimeInteractor {
  static async getSystemTimeInIso8601Format(): Promise<string> {
    const isWindows = process.platform === 'win32'
    if (isWindows) {
      // /bin/date command does not exist on Windows machines.
      return Promise.resolve('')
    }
    const { stdout, stderr } = await exec('/bin/date --iso-8601=seconds')
    if (stderr) {
      throw new Error(stderr)
    }
    return stdout
  }

  static async setSystemTimeInIso8601Format(systemTime: string): Promise<void> {
    const isWindows = process.platform === 'win32'
    if (isWindows) {
      // /bin/date command does not exist on Windows machines.
      return Promise.resolve()
    }
    const { stderr } = await exec(
      `sudo /bin/date --set="${systemTime}" | ${__dirname}/system_to_rtc.sh`,
    )
    if (stderr) {
      throw new Error(stderr)
    }
    return
  }
}
