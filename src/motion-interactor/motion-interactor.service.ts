// © 2024 Luxembourg Institute of Science and Technology
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Cron } from '@nestjs/schedule'
import { MotionClient } from '../motion-client'
import { SettingsService } from '../settings/settings.service'
import { StorageService } from '../storage/storage.service'

@Injectable()
export class MotionInteractorService {
  private readonly logger = new Logger(MotionInteractorService.name)

  constructor(
    private readonly configService: ConfigService,
    private readonly settingsService: SettingsService,
    private readonly storageService: StorageService,
  ) {}

  async pauseDetectionIfActive() {
    const isDetectionActive = await MotionClient.isDetectionStatusActive()
    this.logger.log(`Detection active status: ${isDetectionActive}`)
    if (isDetectionActive) {
      this.logger.log('Trying to pause detection...')
      await MotionClient.pauseDetection()
      this.logger.log('Detection paused!')
    }
  }

  async startDetectionIfNotActive() {
    const isDetectionActive = await MotionClient.isDetectionStatusActive()
    this.logger.log(`Detection active status: ${isDetectionActive}`)
    if (!isDetectionActive) {
      this.logger.log('Trying to start detection...')
      await MotionClient.startDetection()
      this.logger.log('Detection started!')
    }
  }

  @Cron('*/5 * * * *') // every 5 minutes
  async pauseOrResumeDetectionDependingOnDiskSpaceUsageAndTemperature() {
    this.logger.log('Cron job to pause or resume detection triggered...')

    const isDiskSpaceUsageAboveThreshold =
      await this.storageService.isDiskSpaceUsageAboveThreshold()
    this.logger.log(
      `Disk space usage above threshold: ${isDiskSpaceUsageAboveThreshold}`,
    )

    const deviceType = this.configService.get<string>('deviceType')
    let isTemperatureBelowThreshold = false
    if (deviceType === 'RaspberryPi') {
      // Reading the temperature is currently only supported on Raspberry Pi.
      isTemperatureBelowThreshold =
        await this.settingsService.isTemperatureBelowThreshold()
      this.logger.log(
        `Temperature below threshold: ${isTemperatureBelowThreshold}`,
      )
    }

    if (isDiskSpaceUsageAboveThreshold || isTemperatureBelowThreshold) {
      await this.pauseDetectionIfActive()
    } else {
      await this.startDetectionIfNotActive()
    }

    this.logger.log('Cron job to pause or resume detection finished.')
  }
}
