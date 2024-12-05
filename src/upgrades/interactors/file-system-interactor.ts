/**
 * Copyright (C) 2024  Luxembourg Institute of Science and Technology
 *
 * App4Cam is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * App4Cam is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with App4Cam.  If not, see <https://www.gnu.org/licenses/>.
 */
import { exec as execSync } from 'child_process'
import { access, constants, readdir, rm, writeFile } from 'fs/promises'
import path = require('path')
import { promisify } from 'util'
import { CommandExecutionException } from '../../shared/exceptions/CommandExecutionException'
import { CommandUnavailableOnWindowsException } from '../../shared/exceptions/CommandUnavailableOnWindowsException'

const exec = promisify(execSync)

export class FileSystemInteractor {
  static async checkWhetherFileExists(filePath: string): Promise<void> {
    await access(filePath, constants.F_OK)
  }

  static async checkWhetherFileIsReadable(filePath: string): Promise<void> {
    await access(filePath, constants.R_OK)
  }

  static async deleteFile(filePath: string) {
    await rm(filePath)
  }

  static async emptyFolder(folderPath: string): Promise<void> {
    const folderContents = await readdir(folderPath)
    const folderContentsWithoutGitkeep = folderContents.filter(
      (name) => name !== '.gitkeep',
    )
    for (const name of folderContentsWithoutGitkeep) {
      const filePath = path.join(folderPath, name)
      await rm(filePath, { recursive: true, force: true })
    }
  }

  static async extractZipArchive(
    filePath: string,
    outputFolderPath: string,
  ): Promise<void> {
    CommandUnavailableOnWindowsException.throwIfOnWindows()
    const { stderr } = await exec(`unzip -o ${filePath} -d ${outputFolderPath}`)
    if (stderr) {
      throw new CommandExecutionException(stderr)
    }
  }

  static async verifyChecksums(
    checksumFilename: string,
    workingFolderPath: string,
  ): Promise<void> {
    CommandUnavailableOnWindowsException.throwIfOnWindows()
    const { stderr } = await exec(
      `cd ${workingFolderPath} && sha256sum -c ${checksumFilename}`,
    )
    if (stderr) {
      throw new CommandExecutionException(stderr)
    }
  }

  static async writeFile(filePath: string, content: string) {
    await writeFile(filePath, content)
  }
}
