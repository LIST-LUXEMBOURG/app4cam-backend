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
import path = require('path')
import { FileSystemInteractor } from './interactors/file-system-interactor'

const FLAG_FILENAME = 'upgrading'
const FLAG_FILE_CONTENT = 'true'

export class UpgradeFileFlagHandler {
  private flagFilePath: string

  constructor(folderPath: string) {
    this.flagFilePath = path.join(folderPath, FLAG_FILENAME)
  }

  async isFlagSet(): Promise<boolean> {
    try {
      await FileSystemInteractor.checkWhetherFileExists(this.flagFilePath)
      return true
    } catch (error) {
      return false
    }
  }

  async setFlag(): Promise<void> {
    await FileSystemInteractor.writeFile(this.flagFilePath, FLAG_FILE_CONTENT)
  }
}
