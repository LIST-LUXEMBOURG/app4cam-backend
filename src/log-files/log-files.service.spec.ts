/**
 * Copyright (C) 2022-2024  Luxembourg Institute of Science and Technology
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
import { rm, writeFile } from 'fs/promises'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { LogFileInteractor } from './log-file-interactor'
import { LogFilesService } from './log-files.service'

const APP_LOG_FILE_PATH = 'temp/logs/app.log'
const MOTION_LOG_FILE_PATH = 'temp/logs/motion.log'

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
