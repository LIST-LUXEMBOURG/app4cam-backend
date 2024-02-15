// © 2023-2024 Luxembourg Institute of Science and Technology
import { exec as execSync } from 'child_process'
import { promisify } from 'util'
import { Logger } from '@nestjs/common'

const exec = promisify(execSync)

export class AccessPointInteractor {
  private static isWindows(): boolean {
    return process.platform === 'win32'
  }

  static async setAccessPointNameOrPassword(
    name: string,
    password: string,
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
    let command = `sudo ${currentWorkingDirectory}/scripts/variscite/access-point/change-access-point-name-or-password.sh`
    if (name) {
      command += ` -n ${name}`
    }
    if (password) {
      command += ` -p ${password}`
    }
    const { stderr } = await exec(command)
    if (stderr) {
      throw new Error(stderr)
    }
  }

  static async getAccessPointPassword(
    isRaspberryPi: boolean,
    logger: Logger,
  ): Promise<string> {
    if (this.isWindows()) {
      return Promise.resolve('')
    }
    if (isRaspberryPi) {
      logger.error(
        'AccessPointInteractor does not currently support Raspberry Pi for changing the access point name.',
      )
      return
    }
    const currentWorkingDirectory = process.cwd()
    const command = `sudo ${currentWorkingDirectory}/scripts/variscite/access-point/get-access-point-password.sh`
    const { stdout, stderr } = await exec(command)
    if (stderr) {
      throw new Error(stderr)
    }
    const line = stdout.trim()
    const lineParts = line.split(':')
    const password = lineParts[1].trim()
    return password
  }
}
