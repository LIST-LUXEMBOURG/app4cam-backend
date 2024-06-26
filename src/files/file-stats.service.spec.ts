// © 2024 Luxembourg Institute of Science and Technology
import { mkdir, rm, writeFile } from 'fs/promises'
import { Test, TestingModule } from '@nestjs/testing'
import { MotionClient } from '../motion-client'
import { SettingsService } from '../settings/settings.service'
import { FileStatsService } from './file-stats.service'
import { FilesService } from './files.service'

describe(FileStatsService.name, () => {
  const testFolder = 'src/files/test-file-stats-service'

  const mockSettingsService = {
    getShotTypes: jest.fn().mockResolvedValue(new Set(['pictures', 'videos'])),
  }

  let service: FileStatsService
  let spyGetTargetDir

  beforeAll(async () => {
    spyGetTargetDir = jest
      .spyOn(MotionClient, 'getTargetDir')
      .mockImplementation(() => {
        return Promise.resolve(testFolder)
      })
  })

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesService,
        FileStatsService,
        {
          provide: SettingsService,
          useValue: mockSettingsService,
        },
      ],
    }).compile()
    service = module.get<FileStatsService>(FileStatsService)
  })

  it('is defined', () => {
    expect(service).toBeDefined()
  })

  describe('getNumberShotsPerHoursOfDay', () => {
    beforeAll(async () => {
      await mkdir(testFolder)
    })

    describe('when pictures and videos are taken', () => {
      it('returns only zeros with an empty folder', async () => {
        const result = await service.getNumberShotsPerHoursOfDay()
        expect(result).toHaveLength(24)
        expect(result).toEqual(new Array(24).fill(0))
      })

      it('returns only zeroes despite 2 pictures', async () => {
        await writeFile(testFolder + '/a.jpg', 'a')
        await writeFile(testFolder + '/b.jpg', 'a')
        const result = await service.getNumberShotsPerHoursOfDay()
        expect(result).toHaveLength(24)
        expect(result).toEqual(new Array(24).fill(0))
        await rm(testFolder + '/a.jpg')
        await rm(testFolder + '/b.jpg')
      })

      it('returns 3 videos for the current hour', async () => {
        await writeFile(testFolder + '/a.mp4', 'a')
        await writeFile(testFolder + '/b.mp4', 'a')
        await writeFile(testFolder + '/c.mp4', 'a')
        const result = await service.getNumberShotsPerHoursOfDay()
        expect(result).toHaveLength(24)
        const now = new Date()
        const expectedOutput = new Array(24).fill(0)
        expectedOutput[now.getHours()] = 3
        expect(result).toEqual(expectedOutput)
        await rm(testFolder + '/a.mp4')
        await rm(testFolder + '/b.mp4')
        await rm(testFolder + '/c.mp4')
      })
    })

    describe('when pictures only are taken', () => {
      let spy

      beforeAll(() => {
        spy = jest
          .spyOn(mockSettingsService, 'getShotTypes')
          .mockResolvedValue(new Set(['pictures']))
      })

      it('returns only zeros with an empty folder', async () => {
        const result = await service.getNumberShotsPerHoursOfDay()
        expect(result).toHaveLength(24)
        expect(result).toEqual(new Array(24).fill(0))
      })

      it('returns for 2 pictures for the current hour', async () => {
        await writeFile(testFolder + '/a.jpg', 'a')
        await writeFile(testFolder + '/b.jpg', 'a')
        const result = await service.getNumberShotsPerHoursOfDay()
        expect(result).toHaveLength(24)
        const now = new Date()
        const expectedOutput = new Array(24).fill(0)
        expectedOutput[now.getHours()] = 2
        expect(result).toEqual(expectedOutput)
        await rm(testFolder + '/a.jpg')
        await rm(testFolder + '/b.jpg')
      })

      it('returns only zeros despite 3 videos', async () => {
        await writeFile(testFolder + '/a.mp4', 'a')
        await writeFile(testFolder + '/b.mp4', 'a')
        await writeFile(testFolder + '/c.mp4', 'a')
        const result = await service.getNumberShotsPerHoursOfDay()
        expect(result).toHaveLength(24)
        expect(result).toEqual(new Array(24).fill(0))
        await rm(testFolder + '/a.mp4')
        await rm(testFolder + '/b.mp4')
        await rm(testFolder + '/c.mp4')
      })

      afterAll(() => {
        spy.mockReset()
      })
    })

    describe('when videos only are taken', () => {
      let spy

      beforeAll(() => {
        spy = jest
          .spyOn(mockSettingsService, 'getShotTypes')
          .mockResolvedValue(new Set(['videos']))
      })

      it('returns only zeros with an empty folder', async () => {
        const result = await service.getNumberShotsPerHoursOfDay()
        expect(result).toHaveLength(24)
        expect(result).toEqual(new Array(24).fill(0))
      })

      it('returns only zeroes despite 2 pictures', async () => {
        await writeFile(testFolder + '/a.jpg', 'a')
        await writeFile(testFolder + '/b.jpg', 'a')
        const result = await service.getNumberShotsPerHoursOfDay()
        expect(result).toHaveLength(24)
        expect(result).toEqual(new Array(24).fill(0))
        await rm(testFolder + '/a.jpg')
        await rm(testFolder + '/b.jpg')
      })

      it('returns 3 videos for the current hour', async () => {
        await writeFile(testFolder + '/a.mp4', 'a')
        await writeFile(testFolder + '/b.mp4', 'a')
        await writeFile(testFolder + '/c.mp4', 'a')
        const result = await service.getNumberShotsPerHoursOfDay()
        expect(result).toHaveLength(24)
        const now = new Date()
        const expectedOutput = new Array(24).fill(0)
        expectedOutput[now.getHours()] = 3
        expect(result).toEqual(expectedOutput)
        await rm(testFolder + '/a.mp4')
        await rm(testFolder + '/b.mp4')
        await rm(testFolder + '/c.mp4')
      })

      afterAll(() => {
        spy.mockReset()
      })
    })

    afterAll(async () => {
      await rm(testFolder, { recursive: true, force: true })
    })
  })

  afterAll(async () => {
    spyGetTargetDir.mockRestore()
  })
})
