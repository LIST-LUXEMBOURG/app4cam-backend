import { StreamWithContentType } from '../shared/entities/stream-with-content-type.js'
import { FileDeletionResponse } from './entities/file-deletion-response.entity.js'
import { File } from './entities/file.entity.js'
import { StreamWithContentTypeAndFilename } from './entities/stream-with-content-type-and-filename.entity..js'

export interface IFilesService {
  deleteFiles: (filenames: string[]) => Promise<FileDeletionResponse>
  findAll: () => Promise<File[]>
  getStreamableFile: (filename: string) => Promise<StreamWithContentType>
  getStreamableFiles: (
    filenames: string[],
  ) => Promise<StreamWithContentTypeAndFilename>
  removeFile: (filename: string) => Promise<void>
  removeFiles: (filenames: string[]) => Promise<FileDeletionResponse>
  removeAllFiles: () => Promise<void>
  removeOldArchives: () => Promise<void>
}
