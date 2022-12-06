import { lstat, readdir } from 'fs/promises'
import path = require('path')

export class FileSystemInteractor {
  static async getSubdirectories(pathToRead: string): Promise<string[]> {
    const elements = await readdir(pathToRead)
    const elementPromises = elements.map(async (element) => {
      const elementPath = path.join(pathToRead, element)
      const stats = await lstat(elementPath)
      return {
        name: element,
        stats,
      }
    })
    const elementsWithStats = await Promise.all(elementPromises)
    return elementsWithStats
      .filter((element) => element.stats.isDirectory())
      .map((file) => {
        return file.name
      })
  }

  static async getUnixFilePermissions(pathToRead: string): Promise<string> {
    const stats = await lstat(pathToRead)
    const unixFilePermissions =
      '0' + (stats.mode & parseInt('777', 8)).toString(8)
    return unixFilePermissions
  }
}
