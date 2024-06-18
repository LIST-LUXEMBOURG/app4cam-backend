// © 2022-2024 Luxembourg Institute of Science and Technology
import { exec as execSync } from 'child_process'
import { promisify } from 'util'
import { CommandExecutionException } from '../shared/exceptions/CommandExecutionException'
import { CommandUnavailableOnWindowsException } from '../shared/exceptions/CommandUnavailableOnWindowsException'

const exec = promisify(execSync)

export class FileInteractor {
  static async removeAllFilesInDirectory(path: string): Promise<void> {
    CommandUnavailableOnWindowsException.throwIfOnWindows()
    const { stderr } = await exec(`find ${path} -type f -delete`)
    if (stderr) {
      throw new CommandExecutionException(stderr)
    }
  }
}
