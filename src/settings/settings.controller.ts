import { Controller, Get, Body, Put } from '@nestjs/common'
import { DeviceIdDto } from './dto/device-id.dto'
import { SiteNameDto } from './dto/site-name.dto'
import { Settings } from './settings'
import { SettingsService } from './settings.service'

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  getAllSettings(): Promise<Settings> {
    return this.settingsService.getAllSettings()
  }

  @Get('siteName')
  async getSiteName(): Promise<SiteNameDto> {
    const siteName = await this.settingsService.getSiteName()
    return {
      siteName,
    }
  }

  @Put('siteName')
  setSiteName(@Body() body: SiteNameDto): Promise<void> {
    return this.settingsService.setSiteName(body.siteName)
  }

  @Get('deviceId')
  async getDeviceId(): Promise<DeviceIdDto> {
    const deviceId = await this.settingsService.getDeviceId()
    return {
      deviceId,
    }
  }

  @Put('deviceId')
  setDeviceId(@Body() body: DeviceIdDto): Promise<void> {
    return this.settingsService.setDeviceId(body.deviceId)
  }
}
