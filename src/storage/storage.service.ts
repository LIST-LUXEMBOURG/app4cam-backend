import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { MotionClient } from '../motion-client'
import { StorageStatusDto } from './dto/storage-status.dto'
import { StorageUsageDto } from './dto/storage-usage.dto'
import { FileSystemInteractor } from './file-system-interactor'
import { StorageUsageInteractor } from './storage-usage-interactor'

const MOTION_PAUSE_DISK_SPACE_USAGE_THRESHOLD_PERCENTAGE = 1
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
      if (error.code === 'ENOENT') {
        let subdirectories: string[] = []
        try {
          subdirectories = await FileSystemInteractor.getSubdirectories(
            STORAGE_MOUNT_PATH,
          )
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

  getStorageUsage(): Promise<StorageUsageDto> {
    return StorageUsageInteractor.getStorageUsage()
  }

  @Cron('*/5 * * * *') // every 5 minutes
  async pauseOrResumeMotionDependingOnDiskSpaceUsage() {
    this.logger.log('Cron job to pause or resume Motion triggered...')
    const diskSpaceUsage = await StorageUsageInteractor.getStorageUsage()
    this.logger.log(
      `Disk space usage percentage: ${diskSpaceUsage.usedPercentage}`,
    )
    const isMotionActive = await MotionClient.isDetectionStatusActive()
    this.logger.log(`Motion active status: ${isMotionActive}`)
    if (
      diskSpaceUsage.usedPercentage <
      MOTION_PAUSE_DISK_SPACE_USAGE_THRESHOLD_PERCENTAGE
    ) {
      if (isMotionActive) {
        this.logger.log(
          'Below threshold and Motion is still active => Trying to pause Motion...',
        )
        await MotionClient.pauseDetection()
        this.logger.log('Motion paused!')
      }
    } else {
      if (!isMotionActive) {
        this.logger.log(
          'Above threshold and Motion is still inactive => Trying to start Motion...',
        )
        await MotionClient.startDetection()
        this.logger.log('Motion started!')
      }
    }
  }
}
