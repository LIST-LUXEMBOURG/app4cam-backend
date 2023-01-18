import { rm, writeFile } from 'fs/promises'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { MotionClient } from '../motion-client'
import { LogFileInteractor } from './log-file-interactor'
import { LogFilesService } from './log-files.service'

const APP_LOG_FILE_PATH = 'temp/app.log'

const FIXTURE_LOG_FILE_PATH = 'src/log-files/fixtures/a.log'

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
    let spyGetTargetDir

    beforeAll(() => {
      spyGetTargetDir = jest
        .spyOn(MotionClient, 'getLogFilePath')
        .mockImplementation(() => {
          return Promise.resolve(FIXTURE_LOG_FILE_PATH)
        })
    })

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [ConfigService, LogFilesService],
      }).compile()

      service = module.get<LogFilesService>(LogFilesService)
    })

    it('calls the correct method', async () => {
      await service.getMotionLogFileStream()
      expect(spyGetTargetDir).toHaveBeenCalled()
    })

    afterAll(() => {
      spyGetTargetDir.mockRestore()
    })
  })
})
