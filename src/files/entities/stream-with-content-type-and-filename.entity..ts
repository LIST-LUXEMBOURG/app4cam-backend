import { StreamWithContentType } from '../../shared/entities/stream-with-content-type'

export type StreamWithContentTypeAndFilename = StreamWithContentType & {
  filename: string
}
