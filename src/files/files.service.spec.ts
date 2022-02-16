import { Test, TestingModule } from '@nestjs/testing'
import { FilesService } from './files.service'
import { mkdir, readdir, rm, writeFile } from 'fs/promises'
import { ConfigService } from '@nestjs/config'
import { FileHandler } from './file-handler'
import { SettingsService } from '../settings/settings.service'
import { SettingsModule } from '../settings/settings.module'

const FIXTURE_FOLDER_PATH = 'src/files/fixtures'

describe('FilesService', () => {
  it('is defined', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConfigService, FilesService, SettingsService],
      imports: [SettingsModule],
    }).compile()

    const service = module.get<FilesService>(FilesService)
    expect(service).toBeDefined()
  })

  describe('findAll', () => {
    let service: FilesService
    const testFolder = 'src/files/test-find-all'

    beforeAll(() => {
      mkdir(testFolder)
    })

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          {
            provide: ConfigService,
            useValue: {
              get(): string {
                return testFolder
              },
            },
          },
          FilesService,
        ],
        imports: [SettingsModule],
      }).compile()

      service = module.get<FilesService>(FilesService)
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
      await writeFile(testFolder + '/b.txt', 'bb')
      await writeFile(testFolder + '/c.txt', 'cc')
      const files = await service.findAll()
      expect(files).toEqual(expect.any(Array))
      expect(files).toHaveLength(3)
      expect(files[0].name).toEqual('a.txt')
      expect(files[0].creationTime).toEqual(expect.any(Object))
      expect(files[1].name).toEqual('b.txt')
      expect(files[1].creationTime).toEqual(expect.any(Object))
      expect(files[2].name).toEqual('c.txt')
      expect(files[2].creationTime).toEqual(expect.any(Object))
    })

    afterEach(async () => {
      await readdir(testFolder).then((files) =>
        Promise.all(
          files.map((file) => rm(testFolder + '/' + file, { recursive: true })),
        ),
      )
    })

    afterAll(() => {
      rm(testFolder, { recursive: true, force: true })
    })
  })

  describe('getStreamableFile', () => {
    let service: FilesService

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          {
            provide: ConfigService,
            useValue: {
              get(): string {
                return FIXTURE_FOLDER_PATH
              },
            },
          },
          FilesService,
        ],
        imports: [SettingsModule],
      }).compile()

      service = module.get<FilesService>(FilesService)
    })

    it('calls the correct method', async () => {
      const filename = 'a.txt'
      const spy = jest.spyOn(FileHandler, 'createStreamWithContentType')
      service.getStreamableFile(filename)
      expect(spy).toHaveBeenCalled()
    })
  })
})
