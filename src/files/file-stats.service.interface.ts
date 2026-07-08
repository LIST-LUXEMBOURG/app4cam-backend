import { HoursOfDayCounts } from './entities/hours-of-day-counts.entity'

export interface IFileStatsService {
  getNumberShotsPerHoursOfDay: () => Promise<HoursOfDayCounts>
}
