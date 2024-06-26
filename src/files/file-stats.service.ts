// © 2024 Luxembourg Institute of Science and Technology
import { Injectable } from '@nestjs/common'
import { SettingsService } from '../settings/settings.service'
import { File } from './entities/file.entity'
import { HoursOfDayCounts } from './entities/hours-of-day-counts.entity'
import { FileHandler } from './file-handler'
import { FilesService } from './files.service'

@Injectable()
export class FileStatsService {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly filesService: FilesService,
  ) {}

  async getNumberShotsPerHoursOfDay(): Promise<HoursOfDayCounts> {
    const files = await this.filesService.findAll()
    const shotTypes = await this.settingsService.getShotTypes()
    let filteredFiles: File[]
    if (shotTypes.has('videos')) {
      filteredFiles = files.filter(FileHandler.hasFilenameMp4Ending)
    } else {
      filteredFiles = files.filter(
        FileHandler.hasFilenameJpgFileEndingAndNoSnapshotSuffix,
      )
    }
    const counts = FileHandler.countFilesPerHourOfDay(filteredFiles)
    return counts
  }
}
