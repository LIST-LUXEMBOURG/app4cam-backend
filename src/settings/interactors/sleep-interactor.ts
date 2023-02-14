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
    const { stderr } = await exec(`echo "${wakingUpTime}"`) // TODO
    if (stderr) {
      throw new Error(stderr)
    }
  }
}
