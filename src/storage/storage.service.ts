import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { MotionClient } from '../motion-client'
import { DiskSpaceUsageInteractor } from './disk-space-usage-interactor'
import { DiskSpaceUsageDto } from './disk-space-usage.dto'

const MOTION_PAUSE_DISK_SPACE_USAGE_THRESHOLD_PERCENTAGE = 1

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name)

  getStorage(): Promise<DiskSpaceUsageDto> {
    return DiskSpaceUsageInteractor.getDiskSpaceUsage()
  }

  @Cron('*/5 * * * *') // every 5 minutes
  async pauseOrResumeMotionDependingOnDiskSpaceUsage() {
    this.logger.log('Cron job to pause or resume Motion triggered...')
    const diskSpaceUsage = await DiskSpaceUsageInteractor.getDiskSpaceUsage()
    this.logger.log(
      `Disk space usage percentage: ${diskSpaceUsage.usedPercentage}`,
    )
    const isMotionActive = await MotionClient.isDetectionStatusActive()
    this.logger.log(`Motion active status: ${isMotionActive}`)
    if (
      diskSpaceUsage.usedPercentage <
      MOTION_PAUSE_DISK_SPACE_USAGE_THRESHOLD_PERCENTAGE
    ) {
      if (isMotionActive) {
        this.logger.log(
          'Below threshold and Motion is still active => Trying to pause Motion...',
        )
        await MotionClient.pauseDetection()
        this.logger.log('Motion paused!')
      }
    } else {
      if (!isMotionActive) {
        this.logger.log(
          'Above threshold and Motion is still inactive => Trying to start Motion...',
        )
        await MotionClient.startDetection()
        this.logger.log('Motion started!')
      }
    }
  }
}
