// © 2023-2024 Luxembourg Institute of Science and Technology
import { exec as execSync } from 'child_process'
import { promisify } from 'util'
import { Logger } from '@nestjs/common'
import { CommandExecutionException } from '../../shared/exceptions/CommandExecutionException'
import { CommandUnavailableOnWindowsException } from '../../shared/exceptions/CommandUnavailableOnWindowsException'

const exec = promisify(execSync)

export class AccessPointInteractor {
  static async setAccessPointNameOrPassword(
    name: string,
    password: string,
    isRaspberryPi: boolean,
    logger: Logger,
  ): Promise<void> {
    CommandUnavailableOnWindowsException.throwIfOnWindows()
    if (isRaspberryPi) {
      logger.error(
        'AccessPointInteractor does not currently support Raspberry Pi for changing the access point name.',
      )
      return
    }
    const currentWorkingDirectory = process.cwd()
    let command = `sudo ${currentWorkingDirectory}/scripts/runtime/variscite/access-point/change-access-point-name-or-password.sh`
    if (name) {
      command += ` -n ${name}`
    }
    if (password) {
      command += ` -p ${password}`
    }
    const { stderr } = await exec(command)
    if (stderr) {
      throw new CommandExecutionException(stderr)
    }
  }

  static async getAccessPointPassword(
    isRaspberryPi: boolean,
    logger: Logger,
  ): Promise<string> {
    CommandUnavailableOnWindowsException.throwIfOnWindows()
    if (isRaspberryPi) {
      logger.error(
        'AccessPointInteractor does not currently support Raspberry Pi for changing the access point name.',
      )
      return
    }
    const currentWorkingDirectory = process.cwd()
    const command = `sudo ${currentWorkingDirectory}/scripts/runtime/variscite/access-point/get-access-point-password.sh`
    const { stdout, stderr } = await exec(command)
    if (stderr) {
      throw new CommandExecutionException(stderr)
    }
    const line = stdout.trim()
    const lineParts = line.split(':')
    const password = lineParts[1].trim()
    return password
  }
}
