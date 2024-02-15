// © 2022-2024 Luxembourg Institute of Science and Technology
import { StorageStatusDto } from './storage-status.dto'
import { StorageUsageDto } from './storage-usage.dto'

export interface StorageDto {
  status: StorageStatusDto
  usage: StorageUsageDto
}
