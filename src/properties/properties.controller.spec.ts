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
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { SunriseAndSunsetDto } from './dto/sunrise-and-sunset.dto'
import { VersionDto } from './dto/version.dto'
import { PropertiesController } from './properties.controller'
import { PropertiesService } from './properties.service'

const AVAILABLE_TIME_ZONES = ['a', 'b']

const DEVICE_ID = 'a'

const SUNRISE_AND_SUNSET: SunriseAndSunsetDto = {
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

describe(PropertiesController.name, () => {
  let controller: PropertiesController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PropertiesController],
      providers: [
        ConfigService,
        {
          provide: PropertiesService,
          useValue: {
            getAvailableTimeZones: jest
              .fn()
              .mockReturnValue(AVAILABLE_TIME_ZONES),
            getDeviceId: jest.fn().mockReturnValue(DEVICE_ID),
            getNextSunsetAndSunrise: jest
              .fn()
              .mockReturnValue(SUNRISE_AND_SUNSET),
            getVersion: jest.fn().mockReturnValue(VERSION),
          },
        },
      ],
    }).compile()

    controller = module.get<PropertiesController>(PropertiesController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  it('gets the available time zones', async () => {
    const response = await controller.getAvailableTimeZones()
    expect(response).toEqual({ timeZones: AVAILABLE_TIME_ZONES })
  })

  it('gets the device ID', async () => {
    const response = await controller.getDeviceId()
    expect(response).toEqual({ deviceId: DEVICE_ID })
  })

  it('gets the sunrise and sunset', async () => {
    const response = await controller.getSunsetAndSunrise()
    expect(response).toEqual(SUNRISE_AND_SUNSET)
  })

  it('gets the version', async () => {
    const response = await controller.getVersion()
    expect(response).toEqual(VERSION)
  })
})
