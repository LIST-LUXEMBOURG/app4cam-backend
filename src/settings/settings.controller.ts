import { Controller, Get, Body, Put, Patch } from '@nestjs/common'
import { DeviceIdDto } from './dto/device-id.dto'
import { SettingsPatchDto, SettingsPutDto } from './dto/settings.dto'
import { SiteNameDto } from './dto/site-name.dto'
import { SystemTimeDto } from './dto/system-time.dto'
import { Settings } from './settings'
import { SettingsService } from './settings.service'

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  getAllSettings(): Promise<Settings> {
    return this.settingsService.getAllSettings()
  }

  @Patch()
  updateSettings(@Body() settings: SettingsPatchDto): Promise<void> {
    return this.settingsService.updateSettings(settings)
  }

  @Put()
  updateAllSettings(@Body() settings: SettingsPutDto): Promise<void> {
    return this.settingsService.updateAllSettings(settings)
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

  @Get('systemTime')
  async getSystemTime(): Promise<SystemTimeDto> {
    const systemTime = await this.settingsService.getSystemTime()
    return {
      systemTime,
    }
  }

  @Put('systemTime')
  setSystemTime(@Body() body: SystemTimeDto): Promise<void> {
    return this.settingsService.setSystemTime(body.systemTime)
  }
}
