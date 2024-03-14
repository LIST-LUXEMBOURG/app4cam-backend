// © 2023-2024 Luxembourg Institute of Science and Technology
import { rm, writeFile } from 'fs/promises'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { LogFileInteractor } from './log-file-interactor'
import { LogFilesService } from './log-files.service'

const APP_LOG_FILE_PATH = 'temp/app.log'
const MOTION_LOG_FILE_PATH = 'temp/motion.log'

describe(LogFilesService.name, () => {
  let service: LogFilesService

  it('should be defined', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConfigService, LogFilesService],
    }).compile()

    service = module.get<LogFilesService>(LogFilesService)
    expect(service).toBeDefined()
  })

  describe('getAppLogFileStream', () => {
    let service: LogFilesService
    let spyWriteAppLogFileToDisk

    beforeAll(async () => {
      spyWriteAppLogFileToDisk = jest
        .spyOn(LogFileInteractor, 'writeAppLogFileToDisk')
        .mockResolvedValue()
      await writeFile(APP_LOG_FILE_PATH, 'b')
    })

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [ConfigService, LogFilesService],
      }).compile()

      service = module.get<LogFilesService>(LogFilesService)
    })

    it('calls the correct method', async () => {
      await service.getAppLogFileStream()
      expect(spyWriteAppLogFileToDisk).toHaveBeenCalled()
    })

    afterAll(async () => {
      spyWriteAppLogFileToDisk.mockRestore()
      await rm(APP_LOG_FILE_PATH)
    })
  })

  describe('getMotionLogFileStream', () => {
    let service: LogFilesService
    let spyWriteMotionLogFileToDisk

    beforeAll(async () => {
      spyWriteMotionLogFileToDisk = jest
        .spyOn(LogFileInteractor, 'writeMotionLogFileToDisk')
        .mockResolvedValue()
      await writeFile(MOTION_LOG_FILE_PATH, 'c')
    })

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [ConfigService, LogFilesService],
      }).compile()

      service = module.get<LogFilesService>(LogFilesService)
    })

    it('calls the correct method', async () => {
      await service.getMotionLogFileStream()
      expect(spyWriteMotionLogFileToDisk).toHaveBeenCalled()
    })

    afterAll(async () => {
      spyWriteMotionLogFileToDisk.mockRestore()
      await rm(MOTION_LOG_FILE_PATH)
    })
  })
})
