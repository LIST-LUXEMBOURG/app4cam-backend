import { exec as execSync } from 'child_process'
import { promisify } from 'util'

const exec = promisify(execSync)

export class SleepInteractor {
  private static isWindows(): boolean {
    return process.platform === 'win32'
  }

  static async triggerSleeping(wakingUpTime: string): Promise<void> {
    if (this.isWindows()) {
      // timedatectl command does not exist on Windows machines.
      return Promise.resolve()
    }
    const currentWorkingDirectory = process.cwd()
    const { stderr } = await exec(
      `sudo ${currentWorkingDirectory}/scripts/variscite/go-to-sleep.sh "${wakingUpTime}"`,
    )
    if (stderr) {
      throw new Error(stderr)
    }
  }
}
