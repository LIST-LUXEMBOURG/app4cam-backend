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
import { writeFile } from 'fs/promises'
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { MotionClient } from '../motion-client'
import { SettingsService } from '../settings/settings.service'
import { CommandUnavailableOnWindowsException } from '../shared/exceptions/CommandUnavailableOnWindowsException'
import { SunriseAndSunsetDto } from './dto/sunrise-and-sunset.dto'
import { VersionDto } from './dto/version.dto'
import { BatteryInteractor } from './interactors/battery-interactor'
import { MacAddressInteractor } from './interactors/mac-address-interactor'
import { SystemTimeZonesInteractor } from './interactors/system-time-zones-interactor'
import { VersionInteractor } from './interactors/version-interactor'
import { SunriseSunsetCalculator } from './sunrise-sunset-calculator'

const DEVICE_ID_FILENAME = 'device-id.txt'

@Injectable()
export class PropertiesService {
  private readonly logger = new Logger(PropertiesService.name)

  constructor(
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => SettingsService))
    private readonly settingsService: SettingsService,
  ) {}

  async getBatteryVoltage(): Promise<number> {
    const deviceType = this.configService.get<string>('deviceType')
    try {
      const batteryVoltage =
        await BatteryInteractor.getBatteryVoltage(deviceType)
      return batteryVoltage
    } catch (error) {
      if (error instanceof CommandUnavailableOnWindowsException) {
        return -1
      }
      throw error
    }
  }

  async getAvailableTimeZones(): Promise<string[]> {
    try {
      const timeZones = await SystemTimeZonesInteractor.getAvailableTimeZones()
      return timeZones
    } catch (error) {
      if (error instanceof CommandUnavailableOnWindowsException) {
        return Promise.resolve([''])
      }
      throw error
    }
  }

  async getDeviceId(): Promise<string> {
    try {
      const firstMacAddress = await MacAddressInteractor.getFirstMacAddress()
      return firstMacAddress
    } catch (error) {
      if (error instanceof CommandUnavailableOnWindowsException) {
        return '<not supported on Windows>'
      }
      throw error
    }
  }

  async getNextSunsetAndSunrise(): Promise<SunriseAndSunsetDto> {
    const coordinates = await this.settingsService.getLatitudeAndLongitude()
    const today = new Date()
    const todaysTwilights = SunriseSunsetCalculator.calculateSunriseAndSunset(
      today,
      coordinates.latitude,
      coordinates.longitude,
    )
    const tomorrow = new Date()
    tomorrow.setDate(today.getDate() + 1)
    const tomorrowsTwilights =
      SunriseSunsetCalculator.calculateSunriseAndSunset(
        tomorrow,
        coordinates.latitude,
        coordinates.longitude,
      )
    return {
      sunset: todaysTwilights.sunset,
      sunrise: tomorrowsTwilights.sunrise,
    }
  }

  async getVersion(): Promise<VersionDto> {
    return VersionInteractor.getVersion()
  }

  async isCameraConnected(): Promise<boolean> {
    return MotionClient.isCameraConnected()
  }

  async saveDeviceIdToTextFile(): Promise<void> {
    const deviceId = await this.getDeviceId()
    await writeFile(DEVICE_ID_FILENAME, deviceId)
    this.logger.log(
      `Wrote device ID '${deviceId}' to file '${DEVICE_ID_FILENAME}'.`,
    )
  }

  async logVersion() {
    const version = await this.getVersion()
    this.logger.log(
      `App4Cam version ${version.version} - ${version.commitHash}`,
    )
  }
}
