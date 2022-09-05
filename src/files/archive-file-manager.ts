import { createWriteStream } from 'fs'
import { lstat, readdir, rm } from 'fs/promises'
import path = require('path')
import { LoggerService } from '@nestjs/common'
import archiver = require('archiver')

const COMPRESSION_LEVEL = 1 // 0 (no compression) to 9 (best compression), or -1 (default compression)
const TIME_TO_LIVE_MILLISECONDS = 3600000 // 1 hour

export class ArchiveFileManager {
  static createArchiveFilename(
    date: Date,
    deviceName: string,
    siteName: string,
  ): string {
    const time = this.stripHyphensColonsDots(date.toISOString())
    return siteName + '_' + deviceName + '_' + time + '.zip'
  }

  static stripHyphensColonsDots(input: string) {
    return input.replaceAll('-', '').replaceAll(':', '').replaceAll('.', '')
  }

  static async createArchive(
    archiveFilePath: string,
    filePaths: string[],
    logger: LoggerService,
  ): Promise<void> {
    const archive = archiver('zip', {
      zlib: { level: COMPRESSION_LEVEL },
    })
    archive.on('warning', function (error) {
      if (error.code === 'ENOENT') {
        logger.warn(error.message)
      } else {
        throw error
      }
    })
    archive.on('error', function (error) {
      throw error
    })

    const output = createWriteStream(archiveFilePath)
    output.on('close', function () {
      logger.log(
        `The archive has been finalized with ${archive.pointer()} total bytes and the output file descriptor has closed.`,
      )
    })
    output.on('end', function () {
      logger.log('The data of the archive has been drained.')
    })
    archive.pipe(output)

    for (const filePath of filePaths) {
      const name = filePath.substring(filePath.lastIndexOf('/') + 1)
      archive.file(filePath, {
        name,
      })
    }

    await archive.finalize()
  }

  static async removeOldFiles(
    folderPath: string,
    timeToLive = TIME_TO_LIVE_MILLISECONDS,
  ): Promise<void> {
    const files = (await readdir(folderPath)).filter(
      (file) => !this.isUnixHiddenPath(file),
    )
    for (const file of files) {
      const filePath = path.join(folderPath, file)
      const stats = await lstat(filePath)
      const fileCreationTime = new Date(stats.birthtime).getTime()
      const now = new Date().getTime()
      if (fileCreationTime + timeToLive < now) {
        await rm(filePath)
      }
    }
  }

  static isUnixHiddenPath(path): boolean {
    return /(^|\/)\.[^/.]/g.test(path)
  }
}
