// © 2022-2024 Luxembourg Institute of Science and Technology
import { mkdir, rm, writeFile } from 'fs/promises'
import { FileSystemInteractor } from './file-system-interactor'

describe(FileSystemInteractor.name, () => {
  describe(FileSystemInteractor.getNameOfMostRecentlyModifiedFile.name, () => {
    const TEST_FOLDER_PATH =
      'src/snapshots/test-' +
      FileSystemInteractor.getNameOfMostRecentlyModifiedFile.name

    beforeAll(async () => {
      await mkdir(TEST_FOLDER_PATH)
    })

    describe('when three files are created in sequence', () => {
      it('returns the most recently created filename', async () => {
        await writeFile(TEST_FOLDER_PATH + '/a.txt', 'a')
        await new Promise((r) => setTimeout(r, 10))
        await writeFile(TEST_FOLDER_PATH + '/c.txt', 'c')
        await new Promise((r) => setTimeout(r, 10))
        await writeFile(TEST_FOLDER_PATH + '/b.txt', 'b')
        const filename =
          await FileSystemInteractor.getNameOfMostRecentlyModifiedFile(
            TEST_FOLDER_PATH,
          )
        expect(filename).toBe('b.txt')
      })
    })

    afterAll(async () => {
      await rm(TEST_FOLDER_PATH, { recursive: true, force: true })
    })
  })
})
