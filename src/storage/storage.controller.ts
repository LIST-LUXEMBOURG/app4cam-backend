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
