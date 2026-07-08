import { StreamWithContentType } from '../shared/entities/stream-with-content-type'
import { FileDeletionResponse } from './entities/file-deletion-response.entity'
import { File } from './entities/file.entity'
import { StreamWithContentTypeAndFilename } from './entities/stream-with-content-type-and-filename.entity.'

export interface IFilesService {
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
