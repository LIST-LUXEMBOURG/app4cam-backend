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
import { Controller, Get } from '@nestjs/common'
import { BatteryVoltageDto } from './dto/battery-voltage.dto'
import { DeviceIdDto } from './dto/device-id.dto'
import { TimeZonesDto } from './dto/time-zones.dto'
import { VersionDto } from './dto/version.dto'
import { PropertiesService } from './properties.service'

@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Get('batteryVoltage')
  async getBatteryVoltage(): Promise<BatteryVoltageDto> {
    const batteryVoltage = await this.propertiesService.getBatteryVoltage()
    return {
      batteryVoltage,
    }
  }

  @Get('deviceId')
  async getDeviceId(): Promise<DeviceIdDto> {
    const deviceId = await this.propertiesService.getDeviceId()
    return {
      deviceId,
    }
  }

  @Get('timeZones')
  async getAvailableTimeZones(): Promise<TimeZonesDto> {
    const timeZones = await this.propertiesService.getAvailableTimeZones()
    return {
      timeZones,
    }
  }

  @Get('version')
  getVersion(): Promise<VersionDto> {
    return this.propertiesService.getVersion()
  }
}
