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
