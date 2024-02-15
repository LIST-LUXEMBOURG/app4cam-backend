// © 2023-2024 Luxembourg Institute of Science and Technology
import { exec as execSync } from 'child_process'
import { promisify } from 'util'

const exec = promisify(execSync)

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
      `journalctl --user -u ${serviceName} -b > ${logFilePath}`,
    )
    if (stderr) {
      throw new Error(stderr)
    }
  }
}
