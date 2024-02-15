// © 2022-2024 Luxembourg Institute of Science and Technology
import {
  Controller,
  Get,
  Body,
  Put,
  Patch,
  ForbiddenException,
  Res,
} from '@nestjs/common'
import { Response } from 'express'
import { DeviceNameDto } from './dto/device-name.dto'
import { SettingsPatchDto, SettingsPutDto } from './dto/settings.dto'
import { ShotsFolderDto } from './dto/shots-folder.dto'
import { SiteNameDto } from './dto/site-name.dto'
import { SystemTimeDto } from './dto/system-time.dto'
import { TimeZoneDto } from './dto/time-zone.dto'
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
  updateSettings(
    @Body() settings: SettingsPatchDto,
  ): Promise<SettingsPatchDto> {
    return this.settingsService.updateSettings(settings)
  }

  @Put()
  updateAllSettings(@Body() settings: SettingsPutDto): Promise<void> {
    return this.settingsService.updateAllSettings(settings)
  }

  @Get('cameraLight')
  async getCameraLight(@Res() res: Response) {
    const light = await this.settingsService.getCameraLight()
    res.type('text/plain')
    res.send(light)
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

  @Get('deviceName')
  async getDeviceName(): Promise<DeviceNameDto> {
    const deviceName = await this.settingsService.getDeviceName()
    return {
      deviceName,
    }
  }

  @Put('deviceName')
  setDeviceName(@Body() body: DeviceNameDto): Promise<void> {
    return this.settingsService.setDeviceName(body.deviceName)
  }

  @Get('shotsFolder')
  async getShotsFolder(): Promise<ShotsFolderDto> {
    const shotsFolder = await this.settingsService.getShotsFolder()
    return {
      shotsFolder,
    }
  }

  @Put('shotsFolder')
  setShotsFolder(@Body() body: ShotsFolderDto): Promise<void> {
    if (!body.shotsFolder.startsWith('/media/')) {
      throw new ForbiddenException()
    }
    return this.settingsService.setShotsFolder(body.shotsFolder)
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

  @Get('timeZone')
  async getTimeZone(): Promise<TimeZoneDto> {
    const timeZone = await this.settingsService.getTimeZone()
    return {
      timeZone,
    }
  }

  @Put('timeZone')
  setTimeZone(@Body() body: TimeZoneDto): Promise<void> {
    return this.settingsService.setTimeZone(body.timeZone)
  }

  @Get('triggeringLight')
  async getTriggeringLight(@Res() res: Response) {
    const triggeringLight = await this.settingsService.getTriggeringLight()
    res.type('text/plain')
    res.send(triggeringLight)
  }
}
