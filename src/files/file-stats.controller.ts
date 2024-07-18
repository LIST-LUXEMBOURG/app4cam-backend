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
import { Controller, Get } from '@nestjs/common'
import { HoursOfDayCountsDto } from './dto/hours-of-day-counts.dto'
import { FileStatsService } from './file-stats.service'

@Controller('file-stats')
export class FileStatsController {
  constructor(private readonly filesService: FileStatsService) {}

  @Get('number-per-hours-of-day')
  async getNumberShotsPerHoursOfDay(): Promise<HoursOfDayCountsDto> {
    const hoursOfDayCounts =
      await this.filesService.getNumberShotsPerHoursOfDay()
    return {
      hoursOfDayCounts,
    }
  }
}
