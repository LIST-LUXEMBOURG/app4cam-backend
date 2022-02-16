import { createReadStream } from 'fs'
import { MimeTypeDeterminer } from './mime-type-determiner'
import path = require('path')

export class FileHandler {
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
