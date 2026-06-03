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
import { Test, TestingModule } from '@nestjs/testing'
import { server } from '../test/unit/motion-server-mocks/server'
import { MotionClientService } from './motion-client.service'

describe(MotionClientService.name, () => {
  // Establish API mocking before all tests.
  beforeAll(() => server.listen())

  let service: MotionClientService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MotionClientService],
    }).compile()

    service = module.get<MotionClientService>(MotionClientService)
  })

  describe(MotionClientService.prototype.getHeight.name, () => {
    it('returns a value', async () => {
      const response = await service.getHeight()
      expect(response).toBe(1)
    })
  })

  describe(MotionClientService.prototype.getMovieOutput.name, () => {
    it('returns a value', async () => {
      const response = await service.getMovieOutput()
      expect(response).toBe('on')
    })
  })

  describe(MotionClientService.prototype.getMovieQuality.name, () => {
    it('returns a value', async () => {
      const response = await service.getMovieQuality()
      expect(response).toBe(1)
    })
  })

  describe(MotionClientService.prototype.getPictureOutput.name, () => {
    it('returns a value', async () => {
      const response = await service.getPictureOutput()
      expect(response).toBe('on')
    })
  })

  describe(MotionClientService.prototype.getPictureQuality.name, () => {
    it('returns a value', async () => {
      const response = await service.getPictureQuality()
      expect(response).toBe(1)
    })
  })

  describe(MotionClientService.prototype.getTargetDir.name, () => {
    it('returns a value', async () => {
      const response = await service.getTargetDir()
      expect(response).toBe('/a/b/c')
    })
  })

  describe(MotionClientService.prototype.getThreshold.name, () => {
    it('returns a value', async () => {
      const response = await service.getThreshold()
      expect(response).toBe(1)
    })
  })

  describe(MotionClientService.prototype.getVideoDevice.name, () => {
    it('returns a value', async () => {
      const response = await service.getVideoDevice()
      expect(response).toBe('/dev/video0')
    })
  })

  describe(MotionClientService.prototype.getVideoParams.name, () => {
    it('returns a value', async () => {
      const response = await service.getVideoParams()
      expect(response).toBe(
        '"Focus, Auto"=0, "Focus (absolute)"=200, Brightness=16',
      )
    })
  })

  describe(MotionClientService.prototype.getWidth.name, () => {
    it('returns a value', async () => {
      const response = await service.getWidth()
      expect(response).toBe(1)
    })
  })

  describe(MotionClientService.prototype.setLeftTextOnImage.name, () => {
    it('does not throw an error', async () => {
      await expect(service.setLeftTextOnImage('a')).resolves.not.toThrow()
    })
  })

  describe(MotionClientService.prototype.setFilename.name, () => {
    it('does not throw an error', async () => {
      await expect(service.setFilename('a')).resolves.not.toThrow()
    })
  })

  describe(MotionClientService.prototype.setMovieOutput.name, () => {
    it('does not throw an error', async () => {
      await expect(service.setMovieOutput('on')).resolves.not.toThrow()
    })
  })

  describe(MotionClientService.prototype.setMovieQuality.name, () => {
    it('does not throw an error', async () => {
      await expect(service.setMovieQuality(1)).resolves.not.toThrow()
    })
  })

  describe(MotionClientService.prototype.setPictureOutput.name, () => {
    it('does not throw an error', async () => {
      await expect(service.setPictureOutput('on')).resolves.not.toThrow()
    })
  })

  describe(MotionClientService.prototype.setPictureQuality.name, () => {
    it('does not throw an error', async () => {
      await expect(service.setPictureQuality(1)).resolves.not.toThrow()
    })
  })

  describe(MotionClientService.prototype.setTargetDir.name, () => {
    it('does not throw an error', async () => {
      await expect(service.setTargetDir('a/')).resolves.not.toThrow()
    })
  })

  describe(MotionClientService.prototype.setThreshold.name, () => {
    it('does not throw an error', async () => {
      await expect(service.setThreshold(1)).resolves.not.toThrow()
    })
  })

  describe(MotionClientService.prototype.setVideoParams.name, () => {
    it('does not throw an error', async () => {
      await expect(
        service.setVideoParams(
          '"Focus, Auto"=0, "Focus (absolute)"=200, Brightness=16',
        ),
      ).resolves.not.toThrow()
    })
  })

  describe(MotionClientService.prototype.isCameraConnected.name, () => {
    it('returns a value', async () => {
      const response = await service.isCameraConnected()
      expect(response).toBe(true)
    })
  })

  describe(MotionClientService.prototype.isDetectionStatusActive.name, () => {
    it('returns a value', async () => {
      const response = await service.isDetectionStatusActive()
      expect(response).toBe(true)
    })
  })

  describe(MotionClientService.prototype.pauseDetection.name, () => {
    it('does not throw an error', async () => {
      await expect(service.pauseDetection()).resolves.not.toThrow()
    })
  })

  describe(MotionClientService.prototype.startDetection.name, () => {
    it('does not throw an error', async () => {
      await expect(service.startDetection()).resolves.not.toThrow()
    })
  })

  describe(MotionClientService.prototype.takeSnapshot.name, () => {
    it('does not throw an error', async () => {
      await expect(service.takeSnapshot()).resolves.not.toThrow()
    })
  })

  // Reset any request handlers that we may add during the tests, so they don't affect other tests.
  afterEach(() => server.resetHandlers())

  // Clean up after the tests are finished.
  afterAll(() => server.close())
})
