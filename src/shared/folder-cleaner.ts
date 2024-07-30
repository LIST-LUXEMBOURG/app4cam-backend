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
import { lstat, readdir, rm } from 'fs/promises'
import path = require('path')

const TIME_TO_LIVE_MILLISECONDS = 3600000 // 1 hour

export default class FolderCleaner {
  static async removeOldFiles(
    folderPath: string,
    timeToLive = TIME_TO_LIVE_MILLISECONDS,
  ): Promise<void> {
    const files = (await readdir(folderPath)).filter(
      (file) => !this.isUnixHiddenPath(file),
    )
    for (const file of files) {
      const filePath = path.join(folderPath, file)
      const stats = await lstat(filePath)
      const fileCreationTime = new Date(stats.birthtime).getTime()
      const now = new Date().getTime()
      if (fileCreationTime + timeToLive < now) {
        await rm(filePath)
      }
    }
  }

  static isUnixHiddenPath(path): boolean {
    return /(^|\/)\.[^/.]/g.test(path)
  }
}
