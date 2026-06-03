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
import { PassThrough } from 'stream'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { vi } from 'vitest'
import { MotionClientService } from '../motion-client.service'
import { PropertiesService } from '../properties/properties.service'
import { SettingsService } from '../settings/settings.service'
import { FilesController } from './files.controller'
import { FilesService } from './files.service'

describe(FilesController.name, () => {
  let controller: FilesController
  let service: FilesService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilesController],
      providers: [
        ConfigService,
        {
          provide: FilesService,
          useValue: {
            findAll: vi.fn(),
            getStreamableFile: vi.fn(() => ({
              contentType: 'c',
              stream: new PassThrough(),
            })),
            getStreamableFiles: vi.fn(() => ({
              contentType: 'c',
              filename: 'f',
              stream: new PassThrough(),
            })),
            removeFile: vi.fn(),
            removeFiles: vi.fn(() => ({ a: true, b: true })),
          },
        },
        MotionClientService,
        PropertiesService,
        SettingsService,
      ],
    }).compile()

    controller = module.get<FilesController>(FilesController)
    service = module.get<FilesService>(FilesService)
  })

  it('is defined', () => {
    expect(controller).toBeDefined()
  })

  describe(FilesController.prototype.findAll.name, () => {
    it('asks for all files', () => {
      controller.findAll()
      expect(service.findAll).toHaveBeenCalled()
    })
  })

  describe(FilesController.prototype.deleteFile.name, () => {
    it('asks for removing the file', async () => {
      const filename = 'a'
      await controller.deleteFile(filename)
      expect(service.removeFile).toHaveBeenCalledWith(filename)
    })
  })

  describe(FilesController.prototype.deleteFiles.name, () => {
    it('asks for removing the files', async () => {
      const filenames = ['a', 'b']
      const result = await controller.deleteFiles({ filenames })
      expect(service.removeFiles).toHaveBeenCalledWith(filenames)
      const expectedResult = Object.assign(
        {},
        ...filenames.map((filename) => ({ [filename]: true })),
      )
      expect(result).toEqual(expectedResult)
    })
  })

  describe(FilesController.prototype.downloadFile.name, () => {
    it('asks for the streamable file and sets the response', async () => {
      const filename = 'a'
      const mockResponse = {
        set: vi.fn(),
      }
      await controller.downloadFile(filename, mockResponse)
      expect(service.getStreamableFile).toHaveBeenCalledWith(filename)
      expect(mockResponse.set).toHaveBeenCalled()
    })
  })

  describe(FilesController.prototype.downloadFiles.name, () => {
    it('asks for the streamable file and sets the response', async () => {
      const filenames = ['a']
      const mockResponse = {
        set: vi.fn(),
      }
      await controller.downloadFiles({ filenames: filenames }, mockResponse)
      expect(service.getStreamableFiles).toHaveBeenCalledWith(filenames)
      expect(mockResponse.set).toHaveBeenCalled()
    })
  })
})
