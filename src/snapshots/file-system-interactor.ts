/**
 * Copyright (C) 2022-2024  Luxembourg Institute of Science and Technology
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
import { lstat, readdir } from 'fs/promises'
import path = require('path')

export class FileSystemInteractor {
  static async getNameOfMostRecentlyModifiedFile(
    pathToRead: string,
  ): Promise<string> {
    const elements = await readdir(pathToRead)
    const elementPromises = elements.map(async (element) => {
      const elementPath = path.join(pathToRead, element)
      const stats = await lstat(elementPath)
      return {
        name: element,
        stats,
      }
    })
    const elementsWithStats = await Promise.all(elementPromises)
    return elementsWithStats
      .filter((element) => element.stats.isFile())
      .sort((a, b) => {
        return b.stats.mtime.getTime() - a.stats.mtime.getTime()
      })
      .map((file) => {
        return file.name
      })
      .at(0)
  }
}
