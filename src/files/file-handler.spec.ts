// © 2022-2024 Luxembourg Institute of Science and Technology
import { ReadStream } from 'fs'
import { File } from './entities/file.entity'
import { FileHandler } from './file-handler'

const FIXTURE_FOLDER_PATH = 'src/files/fixtures'

describe(FileHandler.name, () => {
  describe(FileHandler.createStreamWithContentType.name, () => {
    it('returns the content type and a stream of the file', () => {
      const filePath = FIXTURE_FOLDER_PATH + '/a.txt'
      const file = FileHandler.createStreamWithContentType(filePath)
      expect(file.contentType).toEqual('text/plain')
      expect(file.stream).toBeInstanceOf(ReadStream)
      file.stream.close()
    })
  })

  describe(FileHandler.compareDatesForSortingDescendingly.name, () => {
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

  describe(FileHandler.countFilesPerHourOfDay.name, () => {
    it('returns only zeros if no file is given', () => {
      expect(FileHandler.countFilesPerHourOfDay([])).toEqual(
        new Array(24).fill(0),
      )
    })

    it('returns the correct counts for thee files', () => {
      const files: File[] = [
        {
          name: 'a',
          creationTime: new Date('2024-06-20T00:01:23'),
        },
        {
          name: 'b',
          creationTime: new Date('2024-06-20T06:12:34'),
        },
        {
          name: 'c',
          creationTime: new Date('2024-06-20T23:23:45'),
        },
      ]
      const expectedResult = new Array(24).fill(0)
      expectedResult[0] = 1
      expectedResult[6] = 1
      expectedResult[23] = 1
      expect(FileHandler.countFilesPerHourOfDay(files)).toEqual(expectedResult)
    })
  })

  describe(FileHandler.hasFilenameMp4Ending.name, () => {
    it('returns true on MP4 file', () => {
      expect(
        FileHandler.hasFilenameMp4Ending({
          creationTime: new Date(),
          name: 'b.mp4',
        }),
      ).toBeTruthy()
    })

    it('returns false on JPG file', () => {
      expect(
        FileHandler.hasFilenameMp4Ending({
          creationTime: new Date(),
          name: 'a.jpg',
        }),
      ).toBeFalsy()
    })
  })

  describe(FileHandler.hasFilenameJpgFileEndingAndNoSnapshotSuffix.name, () => {
    it('returns true on normal JPG file', () => {
      expect(
        FileHandler.hasFilenameJpgFileEndingAndNoSnapshotSuffix({
          creationTime: new Date(),
          name: 'a.jpg',
        }),
      ).toBeTruthy()
    })

    it('returns false on snapshot JPG file', () => {
      expect(
        FileHandler.hasFilenameJpgFileEndingAndNoSnapshotSuffix({
          creationTime: new Date(),
          name: 'a_snapshot.jpg',
        }),
      ).toBeFalsy()
    })

    it('returns false on MP4 file', () => {
      expect(
        FileHandler.hasFilenameJpgFileEndingAndNoSnapshotSuffix({
          creationTime: new Date(),
          name: 'a.mp4',
        }),
      ).toBeFalsy()
    })
  })
})
