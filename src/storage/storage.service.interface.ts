import { StorageStatusDto } from './dto/storage-status.dto'
import { StorageUsageDto } from './dto/storage-usage.dto'

export interface IStorageService {
  getStorageStatus: () => Promise<StorageStatusDto>
  getStorageUsage: () => Promise<StorageUsageDto>
  isDiskSpaceUsageAboveThreshold: () => Promise<boolean>
}
