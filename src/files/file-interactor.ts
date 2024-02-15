// © 2022-2024 Luxembourg Institute of Science and Technology
import { exec as execSync } from 'child_process'
import { promisify } from 'util'

const exec = promisify(execSync)

export class FileInteractor {
  static async removeAllFilesInDirectory(path: string): Promise<void> {
    const isWindows = process.platform === 'win32'
    if (isWindows) {
      // find command does not exist on Windows machines.
      return Promise.resolve()
    }

    const { stderr } = await exec(`find ${path} -type f -delete`)
    if (stderr) {
      throw new Error(stderr)
    }
  }
}
