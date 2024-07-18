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
import { Injectable, Logger } from '@nestjs/common'
import { MotionClient } from '../motion-client'
import { CommandUnavailableOnWindowsException } from '../shared/exceptions/CommandUnavailableOnWindowsException'
import { StorageStatusDto } from './dto/storage-status.dto'
import { StorageUsageDto } from './dto/storage-usage.dto'
import { FileSystemInteractor } from './interactors/file-system-interactor'
import { StorageUsageInteractor } from './interactors/storage-usage-interactor'

const MOTION_PAUSE_DISK_SPACE_USAGE_THRESHOLD_PERCENTAGE = 95
const STORAGE_MOUNT_PATH = '/media'
const WRITE_PERMISSION_MASK = 2

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name)

  async getStorageStatus(): Promise<StorageStatusDto> {
    const devicePath = await MotionClient.getTargetDir()

    let isAvailable = false
    let message: string
    try {
      const unixFilePermissions =
        await FileSystemInteractor.getUnixFilePermissions(devicePath)
      this.logger.debug(
        `UNIX file permissions on ${devicePath}: ${unixFilePermissions}`,
      )
      const groupFolderPermissions = parseInt(unixFilePermissions.charAt(2))
      if (WRITE_PERMISSION_MASK & groupFolderPermissions) {
        isAvailable = true
        message = `The path ${devicePath} is accessible and writable.`
        this.logger.debug(message)
      } else {
        message = `The path ${devicePath} is not writable for the user group.`
        this.logger.error(message)
      }
    } catch (error) {
      Logger.error(error)
      if (
        error.code === 'ENOENT' &&
        devicePath.startsWith(STORAGE_MOUNT_PATH)
      ) {
        let subdirectories: string[] = []
        try {
          subdirectories =
            await FileSystemInteractor.getSubdirectories(STORAGE_MOUNT_PATH)
        } catch (error) {
          Logger.warn(error)
        }

        message = `The path ${devicePath} does not exist`
        if (subdirectories.length == 0) {
          message += `, and there are no subdirectories under ${STORAGE_MOUNT_PATH}.`
        } else {
          message += `, but the following subdirectories exist under ${STORAGE_MOUNT_PATH}: ${subdirectories.join(
            ', ',
          )}`
        }
      } else {
        message = `Accessing the path ${devicePath} resulted in the following error: ${error.message}`
      }
      this.logger.error(message)
    }

    return {
      isAvailable,
      message,
    }
  }

  async getStorageUsage(): Promise<StorageUsageDto> {
    const devicePath = await MotionClient.getTargetDir()
    try {
      const usage = StorageUsageInteractor.getStorageUsage(devicePath)
      return usage
    } catch (error) {
      if (error instanceof CommandUnavailableOnWindowsException) {
        return {
          capacityKb: 0,
          usedPercentage: 0,
        }
      }
      throw error
    }
  }

  async isDiskSpaceUsageAboveThreshold(): Promise<boolean> {
    const diskSpaceUsage = await this.getStorageUsage()
    return (
      diskSpaceUsage.usedPercentage >
      MOTION_PAUSE_DISK_SPACE_USAGE_THRESHOLD_PERCENTAGE
    )
  }
}
