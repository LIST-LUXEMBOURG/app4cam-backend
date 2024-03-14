// © 2023-2024 Luxembourg Institute of Science and Technology
import { exec as execSync } from 'child_process'
import { promisify } from 'util'

const exec = promisify(execSync)

const MOTION_SERVICE_NAME = 'motion'

const SINCE_LOGGING_TIME = '2 weeks ago'

export class LogFileInteractor {
  private static isWindows(): boolean {
    return process.platform === 'win32'
  }

  static async writeAppLogFileToDisk(
    serviceName: string,
    logFilePath: string,
  ): Promise<void> {
    if (this.isWindows()) {
      // The following command does not exist on Windows machines.
      return Promise.resolve()
    }
    const { stderr } = await exec(
      `journalctl --user -u ${serviceName} -S "${SINCE_LOGGING_TIME}" > ${logFilePath}`,
    )
    if (stderr) {
      throw new Error(stderr)
    }
  }

  static async writeMotionLogFileToDisk(logFilePath: string): Promise<void> {
    if (this.isWindows()) {
      // The following command does not exist on Windows machines.
      return Promise.resolve()
    }
    const { stderr } = await exec(
      `sudo journalctl -u ${MOTION_SERVICE_NAME} -S "${SINCE_LOGGING_TIME}" > ${logFilePath}`,
    )
    if (stderr) {
      throw new Error(stderr)
    }
  }
}
