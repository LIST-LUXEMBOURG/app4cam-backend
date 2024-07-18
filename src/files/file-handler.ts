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
import { createReadStream } from 'fs'
import path = require('path')
import { File } from './entities/file.entity'
import { HoursOfDayCounts } from './entities/hours-of-day-counts.entity'
import { MimeTypeDeterminer } from './mime-type-determiner'

export class FileHandler {
  static createStreamWithContentType(filePath: string) {
    const fileExtension = path.extname(filePath)
    const contentType = MimeTypeDeterminer.getContentType(fileExtension)
    const stream = createReadStream(filePath)
    return {
      contentType,
      stream,
    }
  }

  static compareDatesForSortingDescendingly(firstDate: Date, secondDate: Date) {
    if (firstDate > secondDate) {
      return -1
    } else if (firstDate < secondDate) {
      return 1
    }
    return 0
  }

  static countFilesPerHourOfDay(files: File[]): HoursOfDayCounts {
    const counts: HoursOfDayCounts = [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ]
    for (const file of files) {
      const h = file.creationTime.getHours()
      counts[h] += 1
    }
    return counts
  }

  static hasFilenameMp4Ending(file: File): boolean {
    return file.name.endsWith('.mp4')
  }

  static hasFilenameJpgFileEndingAndNoSnapshotSuffix(file: File): boolean {
    return file.name.endsWith('.jpg') && !file.name.endsWith('snapshot.jpg')
  }
}
