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
import { ShotTypesDto } from './dto/shot-types.dto'
import { ShotsFolderDto } from './dto/shots-folder.dto'
import { SiteNameDto } from './dto/site-name.dto'
import { SystemTimeDto } from './dto/system-time.dto'
import { TimeZoneDto } from './dto/time-zone.dto'
import { Settings } from './entities/settings'
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

  @Get('shotTypes')
  async getShotTypes(): Promise<ShotTypesDto> {
    const shotTypes = await this.settingsService.getShotTypes()
    return {
      shotTypes: Array.from(shotTypes),
    }
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
