import { Controller, Get } from '@nestjs/common'
import { DeviceIdDto } from './dto/device-id.dto'
import { VersionDto } from './dto/version.dto'
import { PropertiesService } from './properties.service'

@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Get('deviceId')
  getDeviceId(): Promise<DeviceIdDto> {
    return this.propertiesService.getDeviceId()
  }

  @Get('version')
  getVersion(): Promise<VersionDto> {
    return this.propertiesService.getVersion()
  }
}
