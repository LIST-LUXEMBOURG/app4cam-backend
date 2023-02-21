import { exec as execSync } from 'child_process'
import { promisify } from 'util'
import { LightType } from './settings/settings'

const exec = promisify(execSync)

export class InitialisationInteractor {
  private static isWindows(): boolean {
    return process.platform === 'win32'
  }

  static async initialiseLights(
    serviceName: string,
    lightType: LightType,
  ): Promise<void> {
    if (this.isWindows()) {
      // The following command does not exist on Windows machines.
      return Promise.resolve()
    }
    const { stderr } = await exec(
      `sudo /home/app4cam/${serviceName}/scripts/variscite/switch-off-recording-leds.sh ${lightType}`,
    )
    if (stderr) {
      throw new Error(stderr)
    }
  }
}
