import { access } from 'fs/promises'
import { constants, createReadStream } from 'fs'
import { MimeTypeDeterminer } from './mime-type-determiner'
import path = require('path')

export class FileHandler {
  static async exists(filePath: string): Promise<boolean> {
    try {
      await access(filePath, constants.F_OK)
    } catch (error) {
      return false
    }
    return true
  }

  static createStreamWithContentType(filePath: string) {
    const fileExtension = path.extname(filePath)
    const contentType = MimeTypeDeterminer.getContentType(fileExtension)
    const stream = createReadStream(filePath)
    return {
      contentType,
      stream,
    }
  }
}
