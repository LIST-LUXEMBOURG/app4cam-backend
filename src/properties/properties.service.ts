/**
 * Copyright (C) since 2022 Luxembourg Institute of Science and Technology
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
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Cron } from '@nestjs/schedule'
import { MotionClientService } from '../motion-client.service.js'
import { SettingsService } from '../settings/settings.service.js'
import { SunriseAndSunsetDto } from '../shared/entities/sunrise-and-sunset.dto.js'
import { CommandUnavailableOnWindowsException } from '../shared/exceptions/CommandUnavailableOnWindowsException.js'
import { SystemTimeZonesInteractor } from '../shared/interactors/system-time-zones-interactor.js'
import { SunriseSunsetCalculator } from '../shared/sunrise-sunset-calculator.js'
import { VersionDto } from './dto/version.dto.js'
import { UnsupportedDeviceTypeException } from './exceptions/UnsupportedDeviceTypeException.js'
import { BatteryInteractor } from './interactors/battery-interactor.js'
import { LightTypeInteractor } from './interactors/light-type-interactor.js'
import { MacAddressInteractor } from './interactors/mac-address-interactor.js'
import { VersionInteractor } from './interactors/version-interactor.js'
import { IPropertiesService } from './properties.service.interface.js'

const DEVICE_ID_FILENAME = 'device-id.txt'

@Injectable()
export class PropertiesService implements IPropertiesService {
  private readonly logger = new Logger(PropertiesService.name)

  constructor(
    private readonly configService: ConfigService,
    private readonly motionClientService: MotionClientService,
    private readonly settingsService: SettingsService,
  ) {}

  async getBatteryVoltage(): Promise<number> {
    const deviceType = this.configService.getOrThrow<string>('deviceType')
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
        return []
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

  async getLightType(): Promise<string> {
    const deviceType = this.configService.getOrThrow<string>('deviceType')
    try {
      const lightType = await LightTypeInteractor.getLightType(deviceType)
      return lightType
    } catch (error) {
      if (
        error instanceof CommandUnavailableOnWindowsException ||
        error instanceof UnsupportedDeviceTypeException
      ) {
        return 'unsupported'
      }
      throw error
    }
  }

  async getNextSunsetAndSunrise(): Promise<SunriseAndSunsetDto> {
    const { latitude, longitude } =
      await this.settingsService.getLatitudeAndLongitude()
    return SunriseSunsetCalculator.calculateNextSunsetAndSunrise(
      latitude,
      longitude,
    )
  }

  async getVersion(): Promise<VersionDto> {
    return VersionInteractor.getVersion()
  }

  async isCameraConnected(): Promise<boolean | null> {
    try {
      const status = await this.motionClientService.isCameraConnected()
      return status
    } catch (error) {
      let message = 'The camera connection status could not be retrieved:'
      let stack = undefined
      if (error instanceof Error) {
        message += ` ${error.name}: ${error.message}`
        stack = error.stack
      }
      this.logger.error(message, stack)
      return null
    }
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

  @Cron('*/15 * * * *') // every 15 minutes
  async logBatteryVoltageRegularly(): Promise<void> {
    const deviceType = this.configService.getOrThrow<string>('deviceType')
    try {
      const batteryVoltage =
        await BatteryInteractor.getBatteryVoltage(deviceType)
      this.logger.log(`Current battery voltage: ${batteryVoltage}`)
    } catch (error) {
      if (error instanceof CommandUnavailableOnWindowsException) {
        return
      }
      throw error
    }
  }
}
