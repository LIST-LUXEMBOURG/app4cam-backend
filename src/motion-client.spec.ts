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
import { MotionClient } from './motion-client'
import { server } from './motion-server-mocks/server'

describe(MotionClient.name, () => {
  // Establish API mocking before all tests.
  beforeAll(() => server.listen())

  describe(MotionClient.getHeight.name, () => {
    it('returns a value', async () => {
      const response = await MotionClient.getHeight()
      expect(response).toBe(1)
    })
  })

  describe(MotionClient.getMovieOutput.name, () => {
    it('returns a value', async () => {
      const response = await MotionClient.getMovieOutput()
      expect(response).toBe('on')
    })
  })

  describe(MotionClient.getMovieQuality.name, () => {
    it('returns a value', async () => {
      const response = await MotionClient.getMovieQuality()
      expect(response).toBe(1)
    })
  })

  describe(MotionClient.getPictureOutput.name, () => {
    it('returns a value', async () => {
      const response = await MotionClient.getPictureOutput()
      expect(response).toBe('on')
    })
  })

  describe(MotionClient.getPictureQuality.name, () => {
    it('returns a value', async () => {
      const response = await MotionClient.getPictureQuality()
      expect(response).toBe(1)
    })
  })

  describe(MotionClient.getTargetDir.name, () => {
    it('returns a value', async () => {
      const response = await MotionClient.getTargetDir()
      expect(response).toBe('/a/b/c')
    })
  })

  describe(MotionClient.getThreshold.name, () => {
    it('returns a value', async () => {
      const response = await MotionClient.getThreshold()
      expect(response).toBe(1)
    })
  })

  describe(MotionClient.getVideoDevice.name, () => {
    it('returns a value', async () => {
      const response = await MotionClient.getVideoDevice()
      expect(response).toBe('/dev/video0')
    })
  })

  describe(MotionClient.getVideoParams.name, () => {
    it('returns a value', async () => {
      const response = await MotionClient.getVideoParams()
      expect(response).toBe(
        '"Focus, Auto"=0, "Focus (absolute)"=200, Brightness=16',
      )
    })
  })

  describe(MotionClient.getWidth.name, () => {
    it('returns a value', async () => {
      const response = await MotionClient.getWidth()
      expect(response).toBe(1)
    })
  })

  describe(MotionClient.setLeftTextOnImage.name, () => {
    it('does not throw an error', async () => {
      expect(
        async () => await MotionClient.setLeftTextOnImage('a'),
      ).not.toThrow()
    })
  })

  describe(MotionClient.setFilename.name, () => {
    it.skip('does not throw an error', async () => {
      // ECONNREFUSED as there are more than 2 GET requests performed.
      expect(async () => await MotionClient.setFilename('a')).not.toThrow()
    })
  })

  describe(MotionClient.setMovieOutput.name, () => {
    it('does not throw an error', async () => {
      expect(async () => await MotionClient.setMovieOutput('on')).not.toThrow()
    })
  })

  describe(MotionClient.setMovieQuality.name, () => {
    it('does not throw an error', async () => {
      expect(async () => await MotionClient.setMovieQuality(1)).not.toThrow()
    })
  })

  describe(MotionClient.setPictureOutput.name, () => {
    it('does not throw an error', async () => {
      expect(
        async () => await MotionClient.setPictureOutput('on'),
      ).not.toThrow()
    })
  })

  describe(MotionClient.setPictureQuality.name, () => {
    it('does not throw an error', async () => {
      expect(async () => await MotionClient.setPictureQuality(1)).not.toThrow()
    })
  })

  describe(MotionClient.setTargetDir.name, () => {
    it('does not throw an error', async () => {
      expect(async () => await MotionClient.setTargetDir('a/')).not.toThrow()
    })
  })

  describe(MotionClient.setThreshold.name, () => {
    it('does not throw an error', async () => {
      expect(async () => await MotionClient.setThreshold(1)).not.toThrow()
    })
  })

  describe(MotionClient.setVideoParams.name, () => {
    it('does not throw an error', async () => {
      expect(
        async () =>
          await MotionClient.setVideoParams(
            '"Focus, Auto"=0, "Focus (absolute)"=200, Brightness=16',
          ),
      ).not.toThrow()
    })
  })

  describe(MotionClient.isCameraConnected.name, () => {
    it('returns a value', async () => {
      const response = await MotionClient.isCameraConnected()
      expect(response).toBe(true)
    })
  })

  describe(MotionClient.isDetectionStatusActive.name, () => {
    it('returns a value', async () => {
      const response = await MotionClient.isDetectionStatusActive()
      expect(response).toBe(true)
    })
  })

  describe(MotionClient.pauseDetection.name, () => {
    it('does not throw an error', async () => {
      expect(async () => await MotionClient.pauseDetection()).not.toThrow()
    })
  })

  describe(MotionClient.startDetection.name, () => {
    it('does not throw an error', async () => {
      expect(async () => await MotionClient.startDetection()).not.toThrow()
    })
  })

  describe(MotionClient.takeSnapshot.name, () => {
    it('does not throw an error', async () => {
      expect(async () => await MotionClient.takeSnapshot()).not.toThrow()
    })
  })

  // Reset any request handlers that we may add during the tests, so they don't affect other tests.
  afterEach(() => server.resetHandlers())

  // Clean up after the tests are finished.
  afterAll(() => server.close())
})
