import { Injectable } from '@nestjs/common'
import { File } from './entities/file.entity'
import { lstat, readdir } from 'fs/promises'
import path = require('path')

@Injectable()
export class FilesService {
  fileFolderPath: string

  setFileFolderPath(fileFolerPath: string) {
    this.fileFolderPath = fileFolerPath
  }

  async findAll(): Promise<File[]> {
    const elements = await readdir(this.fileFolderPath)
    const elementPromises = elements.map(async (elementName) => {
      const filePath = path.join(this.fileFolderPath, elementName)
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
          creationTime: file.stats.birthtime,
        }
      })
  }

  // remove(id: number) {
  //   return `This action removes a #${id} file`
  // }
}
