import { Controller, Get } from '@nestjs/common'
import { DiskSpaceUsageDto } from './disk-space-usage.dto'
import { StorageService } from './storage.service'

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Get()
  getStorage(): Promise<DiskSpaceUsageDto> {
    return this.storageService.getStorage()
  }
}
