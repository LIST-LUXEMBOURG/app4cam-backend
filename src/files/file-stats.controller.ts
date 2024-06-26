// © 2024 Luxembourg Institute of Science and Technology
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
