// © 2022-2024 Luxembourg Institute of Science and Technology
import { ReadStream } from 'fs'
import { FileHandler } from './file-handler'

const FIXTURE_FOLDER_PATH = 'src/files/fixtures'

describe('FileHandler', () => {
  describe('createStreamWithContentType', () => {
    it('returns the content type and a stream of the file', () => {
      const filePath = FIXTURE_FOLDER_PATH + '/a.txt'
      const file = FileHandler.createStreamWithContentType(filePath)
      expect(file.contentType).toEqual('text/plain')
      expect(file.stream).toBeInstanceOf(ReadStream)
      file.stream.close()
    })
  })

  describe('compareDatesForSortingDescendingly', () => {
    it('returns -1 if the first date is after the second', () => {
      expect(
        FileHandler.compareDatesForSortingDescendingly(
          new Date('2022-12-11T14:49:00+01:00'),
          new Date('2022-12-11T14:48:00+01:00'),
        ),
      ).toBe(-1)
    })

    it('returns 1 if the first date is before the second', () => {
      expect(
        FileHandler.compareDatesForSortingDescendingly(
          new Date('2022-12-11T14:48:20+01:00'),
          new Date('2022-12-11T14:49:00+01:00'),
        ),
      ).toBe(1)
    })

    it('returns 0 if dates are equal', () => {
      expect(
        FileHandler.compareDatesForSortingDescendingly(
          new Date('2022-12-11T14:48:20+01:00'),
          new Date('2022-12-11T14:48:20+01:00'),
        ),
      ).toBe(0)
    })
  })
})
