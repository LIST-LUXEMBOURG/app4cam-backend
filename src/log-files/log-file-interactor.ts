// © 2023-2024 Luxembourg Institute of Science and Technology
import { exec as execSync } from 'child_process'
import { promisify } from 'util'
import { CommandExecutionException } from '../shared/exceptions/CommandExecutionException'
import { CommandUnavailableOnWindowsException } from '../shared/exceptions/CommandUnavailableOnWindowsException'

const exec = promisify(execSync)

const MOTION_SERVICE_NAME = 'motion'

const SINCE_LOGGING_TIME = '2 weeks ago'

export class LogFileInteractor {
  static async writeAppLogFileToDisk(
    serviceName: string,
    logFilePath: string,
  ): Promise<void> {
    CommandUnavailableOnWindowsException.throwIfOnWindows()
    const { stderr } = await exec(
      `journalctl --user -u ${serviceName} -S "${SINCE_LOGGING_TIME}" > ${logFilePath}`,
    )
    if (stderr) {
      throw new CommandExecutionException(stderr)
    }
  }

  static async writeMotionLogFileToDisk(logFilePath: string): Promise<void> {
    CommandUnavailableOnWindowsException.throwIfOnWindows()
    const { stderr } = await exec(
      `sudo journalctl -u ${MOTION_SERVICE_NAME} -S "${SINCE_LOGGING_TIME}" > ${logFilePath}`,
    )
    if (stderr) {
      throw new CommandExecutionException(stderr)
    }
  }
}
