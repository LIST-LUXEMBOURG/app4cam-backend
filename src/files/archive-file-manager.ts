import md5 = require('md5')
import AdmZip = require('adm-zip')
import { lstat, readdir, rm } from 'fs/promises'
import path = require('path')

const TIME_TO_LIVE_MILLISECONDS = 3600000 // 1 hour

export class ArchiveFileManager {
  static sortAndConcatStrings(strings: string[]): string {
    return strings.sort().join('')
  }

  static createUniqueFilename(filenames: string[]): string {
    return md5(this.sortAndConcatStrings(filenames))
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
