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
