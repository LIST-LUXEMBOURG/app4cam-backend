/**
 * Copyright (C) since 2022 Luxembourg Institute of Science and Technology
 *
 * App4Cam is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * App4Cam is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with App4Cam.  If not, see <https://www.gnu.org/licenses/>.
 */
import { existsSync } from 'fs'
import { mkdir, readdir, rm, writeFile } from 'fs/promises'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { vi } from 'vitest'
import { MotionClientService } from '../motion-client.service'
import { PropertiesService } from '../properties/properties.service'
import { SettingsModule } from '../settings/settings.module'
import { FileHandler } from './file-handler'
import { FileInteractor } from './file-interactor'
import { FilesService } from './files.service'

const FIXTURE_FOLDER_PATH = 'src/files/fixtures'

describe(FilesService.name, () => {
  describe('TODO', () => {
    const spyGetTargetDir = vi.fn().mockResolvedValue('')

    let service: FilesService

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          ConfigService,
          FilesService,
          MotionClientService,
          PropertiesService,
        ],
        imports: [SettingsModule],
      })
        .overrideProvider(MotionClientService)
        .useValue({
          getTargetDir: spyGetTargetDir,
        })
        .compile()

      service = module.get<FilesService>(FilesService)
    })

    it('is defined', async () => {
      expect(service).toBeDefined()
    })

    describe(FilesService.prototype.findAll.name, () => {
      const testFolder = 'src/files/test-find-all'

      beforeAll(async () => {
        await mkdir(testFolder)
        spyGetTargetDir.mockResolvedValue(testFolder)
      })

      it('returns no files', async () => {
        const files = await service.findAll()
        expect(files).toEqual([])
      })

      it('returns one file', async () => {
        await writeFile(testFolder + '/a.txt', 'b')
        const files = await service.findAll()
        expect(files).toEqual(expect.any(Array))
        expect(files).toHaveLength(1)
        expect(files[0].name).toEqual('a.txt')
        expect(files[0].creationTime).toEqual(expect.any(Object))
      })

      it('returns three files', async () => {
        await writeFile(testFolder + '/a.txt', 'aa')
        await new Promise((resolve) => setTimeout(resolve, 10))
        await writeFile(testFolder + '/b.txt', 'bb')
        await new Promise((resolve) => setTimeout(resolve, 10))
        await writeFile(testFolder + '/c.txt', 'cc')
        const files = await service.findAll()
        expect(files).toEqual(expect.any(Array))
        expect(files).toHaveLength(3)
        expect(files[0].name).toEqual('c.txt')
        expect(files[0].creationTime).toEqual(expect.any(Object))
        expect(files[1].name).toEqual('b.txt')
        expect(files[1].creationTime).toEqual(expect.any(Object))
        expect(files[2].name).toEqual('a.txt')
        expect(files[2].creationTime).toEqual(expect.any(Object))
      })

      afterEach(async () => {
        await readdir(testFolder).then((files) =>
          Promise.all(
            files.map((file) =>
              rm(testFolder + '/' + file, { recursive: true }),
            ),
          ),
        )
      })

      afterAll(async () => {
        await rm(testFolder, { recursive: true, force: true })
        spyGetTargetDir.mockRestore()
      })
    })

    describe(FilesService.prototype.getStreamableFile.name, () => {
      beforeAll(() => {
        spyGetTargetDir.mockResolvedValue(FIXTURE_FOLDER_PATH)
      })

      it('calls the correct method', async () => {
        const filename = 'a.txt'
        const spy = vi.spyOn(FileHandler, 'createStreamWithContentType')
        await service.getStreamableFile(filename)
        expect(spy).toHaveBeenCalled()
      })

      afterAll(() => {
        spyGetTargetDir.mockRestore()
      })
    })

    describe(FilesService.prototype.removeFile.name, () => {
      const testFolder = 'src/files/test-delete-file'

      beforeAll(async () => {
        await mkdir(testFolder)
        spyGetTargetDir.mockResolvedValue(testFolder)
      })

      it('removes the file', async () => {
        const filename = 'a.txt'
        const filePath = testFolder + '/' + filename
        await writeFile(filePath, 'b')
        await service.removeFile(filename)
        expect(existsSync(filePath)).toBeFalsy()
      })

      it('throws an error if the file does not exist', async () => {
        await expect(service.removeFile('b.txt')).rejects.toMatchObject({
          code: 'ENOENT',
        })
      })

      it('removes two files', async () => {
        const filenames = ['c.txt', 'd.txt']
        const filePaths = filenames.map(
          (filename) => testFolder + '/' + filename,
        )
        for (const filePath of filePaths) {
          await writeFile(filePath, 'b')
        }
        const result = await service.removeFiles(filenames)
        const expectedResult = Object.assign(
          {},
          ...filenames.map((filename) => ({ [filename]: true })),
        )
        expect(result).toEqual(expectedResult)
        for (const filePath of filePaths) {
          expect(existsSync(filePath)).toBeFalsy()
        }
      })

      it('swallows non-existing file', async () => {
        const filenames = ['c.txt', 'd.txt']
        const filePaths = filenames.map(
          (filename) => testFolder + '/' + filename,
        )
        await writeFile(filePaths[1], 'b')
        const result = await service.removeFiles(filenames)
        const expectedResult = {
          [filenames[0]]: false,
          [filenames[1]]: true,
        }
        expect(result).toEqual(expectedResult)
      })

      afterAll(async () => {
        await rm(testFolder, { recursive: true, force: true })
        spyGetTargetDir.mockRestore()
      })
    })

    describe(FilesService.prototype.removeAllFiles.name, () => {
      beforeAll(() => {
        spyGetTargetDir.mockResolvedValue(FIXTURE_FOLDER_PATH)
      })

      it('calls method on FileInteractor with path', async () => {
        const spy = vi
          .spyOn(FileInteractor, 'removeAllFilesInDirectory')
          .mockResolvedValue()
        await service.removeAllFiles()
        expect(spy).toHaveBeenCalledWith(FIXTURE_FOLDER_PATH)
        spy.mockRestore()
      })

      afterAll(() => {
        spyGetTargetDir.mockRestore()
      })
    })
  })
})
