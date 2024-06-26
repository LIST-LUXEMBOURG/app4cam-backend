// © 2022-2024 Luxembourg Institute of Science and Technology
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
