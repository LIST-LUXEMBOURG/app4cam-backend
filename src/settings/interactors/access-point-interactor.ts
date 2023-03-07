import { exec as execSync } from 'child_process'
import { promisify } from 'util'
import { Logger } from '@nestjs/common'

const exec = promisify(execSync)

export class AccessPointInteractor {
  private static isWindows(): boolean {
    return process.platform === 'win32'
  }

  static async setAccessPointName(
    name: string,
    isRaspberryPi: boolean,
    logger: Logger,
  ): Promise<void> {
    if (this.isWindows()) {
      return Promise.resolve()
    }
    if (isRaspberryPi) {
      logger.error(
        'AccessPointInteractor does not currently support Raspberry Pi for changing the access point name.',
      )
      return
    }
    const currentWorkingDirectory = process.cwd()
    const { stderr } = await exec(
      `sudo ${currentWorkingDirectory}/scripts/variscite/access-point/change-access-point-name.sh "${name}"`,
    )
    if (stderr) {
      throw new Error(stderr)
    }
  }
}
