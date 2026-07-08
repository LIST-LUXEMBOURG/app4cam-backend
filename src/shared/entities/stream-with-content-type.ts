import { ReadStream } from 'fs'

export type StreamWithContentType = {
  contentType: string
  stream: ReadStream
}
