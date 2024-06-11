// © 2022-2024 Luxembourg Institute of Science and Technology
import { lstat, readdir, rm } from 'fs/promises'
import path = require('path')
import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { MotionClient } from '../motion-client'
import { SettingsService } from '../settings/settings.service'
import { ArchiveFileManager } from './archive-file-manager'
import { FileDeletionResponse } from './entities/file-deletion-response.entity'
import { File } from './entities/file.entity'
import { FileHandler } from './file-handler'
import { FileInteractor } from './file-interactor'
import { FileNamer } from './file-namer'

const ARCHIVE_FOLDER_PATH = 'temp' // also used by log files module

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name)

  constructor(private readonly settingsService: SettingsService) {}

  async findAll(): Promise<File[]> {
    const fileFolderPath = await MotionClient.getTargetDir()
    const elements = await readdir(fileFolderPath)
    const elementPromises = elements.map(async (elementName) => {
      const filePath = path.join(fileFolderPath, elementName)
      const stats = await lstat(filePath)
      return {
        name: elementName,
        stats,
      }
    })
    const elementsWithStats = await Promise.all(elementPromises)
    return elementsWithStats
      .filter((element) => element.stats.isFile())
      .map((file) => {
        return {
          name: file.name,
          creationTime: file.stats.mtime,
        }
      })
      .sort((a, b) =>
        FileHandler.compareDatesForSortingDescendingly(
          a.creationTime,
          b.creationTime,
        ),
      )
  }

  async getStreamableFile(filename: string) {
    const fileFolderPath = await MotionClient.getTargetDir()
    const filePath = path.join(fileFolderPath, filename)
    return FileHandler.createStreamWithContentType(filePath)
  }

  async getStreamableFiles(filenames: string[]) {
    const now = new Date()
    const settings = await this.settingsService.getAllSettings()
    const archiveFilename = FileNamer.createFilename(
      now,
      settings.general.deviceName,
      settings.general.siteName,
      '.zip',
      settings.general.timeZone,
    )
    const archiveFilePath = path.join(ARCHIVE_FOLDER_PATH, archiveFilename)
    const fileFolderPath = await MotionClient.getTargetDir()
    const filePaths = filenames.map((filename) =>
      path.join(fileFolderPath, filename),
    )
    const logger = new Logger(ArchiveFileManager.name)
    await ArchiveFileManager.createArchive(archiveFilePath, filePaths, logger)
    const streamableFile =
      FileHandler.createStreamWithContentType(archiveFilePath)
    return {
      filename: archiveFilename,
      ...streamableFile,
    }
  }

  async removeFile(filename: string): Promise<void> {
    const fileFolderPath = await MotionClient.getTargetDir()
    const filePath = path.join(fileFolderPath, filename)
    await rm(filePath)
  }

  async removeFiles(filenames: string[]): Promise<FileDeletionResponse> {
    const result: FileDeletionResponse = {}
    for (const filename of filenames) {
      try {
        await this.removeFile(filename)
        result[filename] = true
      } catch {
        result[filename] = false
      }
    }
    return result
  }

  async removeAllFiles(): Promise<void> {
    const fileFolderPath = await MotionClient.getTargetDir()
    FileInteractor.removeAllFilesInDirectory(fileFolderPath)
  }

  @Cron('*/5 * * * *') // every 5 minutes
  removeOldArchives() {
    this.logger.log('Cron job to delete old archives triggered...')
    ArchiveFileManager.removeOldFiles(ARCHIVE_FOLDER_PATH)
  }
}
