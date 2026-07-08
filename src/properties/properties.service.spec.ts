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
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { Mock, vi } from 'vitest'
import { MotionClientService } from '../motion-client.service'
import { IMotionClientService } from '../motion-client.service.interface'
import { SettingsService } from '../settings/settings.service'
import { CommandUnavailableOnWindowsException } from '../shared/exceptions/CommandUnavailableOnWindowsException'
import { VersionDto } from './dto/version.dto'
import { UnsupportedDeviceTypeException } from './exceptions/UnsupportedDeviceTypeException'
import { LightTypeInteractor } from './interactors/light-type-interactor'
import { MacAddressInteractor } from './interactors/mac-address-interactor'
import { SystemTimeZonesInteractor } from './interactors/system-time-zones-interactor'
import { VersionInteractor } from './interactors/version-interactor'
import { PropertiesService } from './properties.service'
import { SunriseSunsetCalculator } from './sunrise-sunset-calculator'

const AVAILABLE_TIME_ZONES = ['t1', 't2']

const DEVICE_ID = 'a'

const LIGHT_TYPE = 'visible'

const SUNRISE_AND_SUNSET = {
  sunrise: {
    hour: 1,
    minute: 2,
  },
  sunset: {
    hour: 3,
    minute: 4,
  },
}

const VERSION: VersionDto = {
  commitHash: 'a',
  version: 'b',
}

describe(PropertiesService.name, () => {
  const spyIsCameraConnected = vi.fn()

  class MockMotionClientService implements Partial<IMotionClientService> {
    isCameraConnected = spyIsCameraConnected
  }

  let service: PropertiesService
  let spyGetAvailableTimeZones: Mock

  beforeAll(() => {
    spyGetAvailableTimeZones = vi
      .spyOn(SystemTimeZonesInteractor, 'getAvailableTimeZones')
      .mockResolvedValue(AVAILABLE_TIME_ZONES)
  })

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigService,
        { provide: MotionClientService, useClass: MockMotionClientService },
        PropertiesService,
        SettingsService,
      ],
    }).compile()

    service = module.get<PropertiesService>(PropertiesService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('get the available time zones', async () => {
    const timeZones = await service.getAvailableTimeZones()
    expect(timeZones).toBe(AVAILABLE_TIME_ZONES)
  })

  it('gets the device ID', async () => {
    const spyGetDeviceId = vi
      .spyOn(MacAddressInteractor, 'getFirstMacAddress')
      .mockResolvedValue(DEVICE_ID)
    const response = await service.getDeviceId()
    expect(response).toBe(DEVICE_ID)
    spyGetDeviceId.mockRestore()
  })

  it('gets the light type', async () => {
    const spy = vi
      .spyOn(LightTypeInteractor, 'getLightType')
      .mockResolvedValue(LIGHT_TYPE)
    const response = await service.getLightType()
    expect(response).toBe(LIGHT_TYPE)
    spy.mockRestore()
  })

  it('returns unsupported when requesting the light type on unsupported device', async () => {
    const spy = vi
      .spyOn(LightTypeInteractor, 'getLightType')
      .mockImplementation(() => {
        throw new UnsupportedDeviceTypeException('a')
      })
    const response = await service.getLightType()
    expect(response).toBe('unsupported')
    spy.mockRestore()
  })

  it('returns unsupported when requesting the light type on Windows', async () => {
    const spy = vi
      .spyOn(LightTypeInteractor, 'getLightType')
      .mockImplementation(() => {
        throw new CommandUnavailableOnWindowsException()
      })
    const response = await service.getLightType()
    expect(response).toBe('unsupported')
    spy.mockRestore()
  })

  it('gets the sunrise and sunset', async () => {
    const spyCalculateSunriseAndSunset = vi
      .spyOn(SunriseSunsetCalculator, 'calculateSunriseAndSunset')
      .mockReturnValue(SUNRISE_AND_SUNSET)
    const response = await service.getNextSunsetAndSunrise()
    expect(response).toEqual(SUNRISE_AND_SUNSET)
    spyCalculateSunriseAndSunset.mockRestore()
  })

  it('gets the version', async () => {
    const spyGetVersion = vi
      .spyOn(VersionInteractor, 'getVersion')
      .mockImplementation(() => {
        return Promise.resolve(VERSION)
      })
    const response = await service.getVersion()
    expect(response).toEqual(VERSION)
    spyGetVersion.mockRestore()
  })

  it('gets the camera connection flag', async () => {
    const cameraConnectionFlag = true
    spyIsCameraConnected.mockImplementation(() => {
      return Promise.resolve(cameraConnectionFlag)
    })
    const response = await service.isCameraConnected()
    expect(response).toEqual(cameraConnectionFlag)
    spyIsCameraConnected.mockRestore()
  })

  it('gets the unknown camera connection flag when an error happens', async () => {
    spyIsCameraConnected.mockImplementation(() => {
      throw new Error()
    })
    const response = await service.isCameraConnected()
    expect(response).toBeNull()
    spyIsCameraConnected.mockRestore()
  })

  afterAll(() => {
    spyGetAvailableTimeZones.mockRestore()
  })
})
