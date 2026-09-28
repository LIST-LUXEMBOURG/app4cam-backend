import { StreamWithContentType } from '../../shared/entities/stream-with-content-type.js'

export type StreamWithContentTypeAndFilename = StreamWithContentType & {
  filename: string
}
