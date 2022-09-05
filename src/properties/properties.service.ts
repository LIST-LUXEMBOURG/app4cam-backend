import { Injectable } from '@nestjs/common'
import { DeviceIdDto } from './dto/device-id.dto'
import { VersionDto } from './dto/version.dto'
import { MacAddressInteractor } from './interactors/mac-address-interactor'
import { VersionInteractor } from './interactors/version-interactor'

@Injectable()
export class PropertiesService {
  async getDeviceId(): Promise<DeviceIdDto> {
    const firstMacAddress = await MacAddressInteractor.getFirstMacAddress()
    return {
      deviceId: firstMacAddress,
    }
  }

  getVersion(): Promise<VersionDto> {
    return VersionInteractor.getVersion()
  }
}
