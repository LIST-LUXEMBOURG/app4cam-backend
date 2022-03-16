import { Injectable } from '@nestjs/common'
import { DiskSpaceUsageInteractor } from './disk-space-usage-interactor'

@Injectable()
export class StorageService {
  getStorage() {
    return DiskSpaceUsageInteractor.getDiskSpaceUsage()
  }
}
