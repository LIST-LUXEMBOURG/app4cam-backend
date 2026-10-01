/**
 * Copyright (C) since 2026 Luxembourg Institute of Science and Technology
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
import { Controller, HttpCode, Post } from '@nestjs/common'
import { DeviceService } from './device.service.js'

@Controller('device')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Post('reboot')
  @HttpCode(200)
  reboot(): Promise<void> {
    return this.deviceService.reboot()
  }

  @Post('shutDown')
  @HttpCode(200)
  shutDown(): Promise<void> {
    return this.deviceService.shutDown()
  }
}
