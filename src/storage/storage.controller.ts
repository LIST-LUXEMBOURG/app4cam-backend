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
import { StorageStatusDto } from './dto/storage-status.dto'
import { StorageUsageDto } from './dto/storage-usage.dto'
import { StorageDto } from './dto/storage.dto'
import { StorageService } from './storage.service'

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Get()
  async getStorage(): Promise<StorageDto> {
    const usage = await this.storageService.getStorageUsage()
    const status = await this.storageService.getStorageStatus()
    return {
      usage,
      status,
    }
  }

  @Get('status')
  getStorageStatus(): Promise<StorageStatusDto> {
    return this.storageService.getStorageStatus()
  }

  @Get('usage')
  getStorageUsage(): Promise<StorageUsageDto> {
    return this.storageService.getStorageUsage()
  }
}
