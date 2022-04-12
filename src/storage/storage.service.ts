import { Injectable } from '@nestjs/common'
import { DiskSpaceUsageInteractor } from './disk-space-usage-interactor'
import { DiskSpaceUsageDto } from './disk-space-usage.dto'

@Injectable()
export class StorageService {
  getStorage(): Promise<DiskSpaceUsageDto> {
    return DiskSpaceUsageInteractor.getDiskSpaceUsage()
  }
}
