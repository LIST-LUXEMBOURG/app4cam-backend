import { writeFile } from 'fs/promises'
import { Injectable, Logger } from '@nestjs/common'
import { DeviceIdDto } from './dto/device-id.dto'
import { VersionDto } from './dto/version.dto'
import { MacAddressInteractor } from './interactors/mac-address-interactor'
import { SystemTimeZonesInteractor } from './interactors/system-time-zones-interactor'
import { VersionInteractor } from './interactors/version-interactor'

const DEVICE_ID_FILENAME = 'device-id.txt'

@Injectable()
export class PropertiesService {
  private readonly logger = new Logger(PropertiesService.name)

  async getAvailableTimeZones(): Promise<string[]> {
    const timeZones = await SystemTimeZonesInteractor.getAvailableTimeZones()
    return timeZones
  }

  async getDeviceId(): Promise<DeviceIdDto> {
    const firstMacAddress = await MacAddressInteractor.getFirstMacAddress()
    return {
      deviceId: firstMacAddress,
    }
  }

  getVersion(): Promise<VersionDto> {
    return VersionInteractor.getVersion()
  }

  async saveDeviceIdToTextFile(): Promise<void> {
    const firstMacAddress = await MacAddressInteractor.getFirstMacAddress()
    await writeFile(DEVICE_ID_FILENAME, firstMacAddress)
    this.logger.log(
      `Wrote device ID '${firstMacAddress}' to file '${DEVICE_ID_FILENAME}'.`,
    )
  }
}
