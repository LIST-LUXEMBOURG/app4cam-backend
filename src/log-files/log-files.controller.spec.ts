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
import { PassThrough } from 'stream'
import { Test, TestingModule } from '@nestjs/testing'
import { LogFilesController } from './log-files.controller'
import { LogFilesService } from './log-files.service'

describe(LogFilesController.name, () => {
  let controller: LogFilesController
  let service: LogFilesService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LogFilesController],
      providers: [
        {
          provide: LogFilesService,
          useValue: {
            getAppLogFileStream: jest.fn(() => new PassThrough()),
            getMotionLogFileStream: jest.fn(() => new PassThrough()),
          },
        },
      ],
    }).compile()

    controller = module.get<LogFilesController>(LogFilesController)
    service = module.get<LogFilesService>(LogFilesService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('downloadAppLogFile', () => {
    it('asks for the streamable file and sets the response', async () => {
      const mockResponse = {
        set: jest.fn(),
      }
      await controller.downloadAppLogFile(mockResponse)
      expect(service.getAppLogFileStream).toHaveBeenCalled()
      expect(mockResponse.set).toHaveBeenCalled()
    })
  })

  describe('downloadMotionLogFile', () => {
    it('asks for the streamable file and sets the response', async () => {
      const mockResponse = {
        set: jest.fn(),
      }
      await controller.downloadMotionLogFile(mockResponse)
      expect(service.getMotionLogFileStream).toHaveBeenCalled()
      expect(mockResponse.set).toHaveBeenCalled()
    })
  })
})
