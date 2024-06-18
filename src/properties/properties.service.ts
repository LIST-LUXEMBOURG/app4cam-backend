// © 2022-2024 Luxembourg Institute of Science and Technology
import { writeFile } from 'fs/promises'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { CommandUnavailableOnWindowsException } from '../shared/exceptions/CommandUnavailableOnWindowsException'
import { VersionDto } from './dto/version.dto'
import { BatteryInteractor } from './interactors/battery-interactor'
import { MacAddressInteractor } from './interactors/mac-address-interactor'
import { SystemTimeZonesInteractor } from './interactors/system-time-zones-interactor'
import { VersionInteractor } from './interactors/version-interactor'

const DEVICE_ID_FILENAME = 'device-id.txt'

@Injectable()
export class PropertiesService {
  private readonly logger = new Logger(PropertiesService.name)

  constructor(private readonly configService: ConfigService) {}

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

  async getVersion(): Promise<VersionDto> {
    return VersionInteractor.getVersion()
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
