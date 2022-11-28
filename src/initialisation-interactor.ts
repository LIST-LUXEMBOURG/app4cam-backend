import { exec as execSync } from 'child_process'
import { promisify } from 'util'

const exec = promisify(execSync)

export class InitialisationInteractor {
  private static isWindows(): boolean {
    return process.platform === 'win32'
  }

  static async initialiseLights(): Promise<void> {
    if (this.isWindows()) {
      // timedatectl command does not exist on Windows machines.
      return Promise.resolve()
    }
    const { stderr } = await exec(
      'sudo /home/app4cam/app4cam-backend/scripts/variscite/initialise-leds.sh',
    )
    if (stderr) {
      throw new Error(stderr)
    }
  }
}
