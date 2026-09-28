import { HoursOfDayCounts } from './entities/hours-of-day-counts.entity.js'

export interface IFileStatsService {
  getNumberShotsPerHoursOfDay: () => Promise<HoursOfDayCounts>
}
