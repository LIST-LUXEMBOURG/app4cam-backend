import { StorageStatusDto } from './dto/storage-status.dto.js'
import { StorageUsageDto } from './dto/storage-usage.dto.js'

export interface IStorageService {
  getStorageStatus: () => Promise<StorageStatusDto>
  getStorageUsage: () => Promise<StorageUsageDto>
  isDiskSpaceUsageAboveThreshold: () => Promise<boolean>
}
