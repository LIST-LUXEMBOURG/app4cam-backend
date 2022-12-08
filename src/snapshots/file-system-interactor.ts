import { lstat, readdir } from 'fs/promises'
import path = require('path')

export class FileSystemInteractor {
  static async getNameOfMostRecentlyModifiedFile(
    pathToRead: string,
  ): Promise<string> {
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
      .filter((element) => element.stats.isFile())
      .sort((a, b) => {
        return b.stats.mtime.getTime() - a.stats.mtime.getTime()
      })
      .map((file) => {
        return file.name
      })
      .at(0)
  }
}
