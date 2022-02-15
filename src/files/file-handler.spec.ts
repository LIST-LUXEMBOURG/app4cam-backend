import { FileHandler } from './file-handler'
import { ReadStream } from 'fs'

const FIXTURE_FOLDER_PATH = 'src/files/fixtures'

describe('FileHandler', () => {
  describe('exists', () => {
    it('returns true if the file exists', async () => {
      expect(
        await FileHandler.exists(FIXTURE_FOLDER_PATH + '/a.txt'),
      ).toBeTruthy()
    })

    it('returns false if the file does not exist', async () => {
      expect(
        await FileHandler.exists(FIXTURE_FOLDER_PATH + '/z.txt'),
      ).toBeFalsy()
    })
  })

  describe('createStreamWithContentType', () => {
    it('returns the content type and a stream of the file', () => {
      const filePath = FIXTURE_FOLDER_PATH + '/a.txt'
      const file = FileHandler.createStreamWithContentType(filePath)
      expect(file.contentType).toEqual('text/plain')
      expect(file.stream).toBeInstanceOf(ReadStream)
      file.stream.close()
    })
  })
})
