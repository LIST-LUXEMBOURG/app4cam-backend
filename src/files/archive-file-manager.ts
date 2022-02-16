import AdmZip = require('adm-zip')
import { lstat, readdir, rm } from 'fs/promises'
import path = require('path')

const TIME_TO_LIVE_MILLISECONDS = 3600000 // 1 hour

export class ArchiveFileManager {
  static createArchiveFilename(
    date: Date,
    deviceId: string,
    siteName: string,
  ): string {
    const time = this.stripHyphensColonsDots(date.toISOString())
    return siteName + '_' + deviceId + '_' + time + '.zip'
  }

  static stripHyphensColonsDots(input: string) {
    return input.replaceAll('-', '').replaceAll(':', '').replaceAll('.', '')
  }

  static createArchive(archiveFilePath: string, filePaths: string[]): void {
    const zip = new AdmZip()
    for (const filePath of filePaths) {
      zip.addLocalFile(filePath)
    }
    zip.writeZip(archiveFilePath)
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
