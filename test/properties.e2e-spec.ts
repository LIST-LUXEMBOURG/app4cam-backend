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
import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import * as request from 'supertest'
import { AppModule } from '../src/app.module'
import { SunriseAndSunsetDto } from '../src/properties/dto/sunrise-and-sunset.dto'
import { VersionDto } from '../src/properties/dto/version.dto'
import { BatteryInteractor } from '../src/properties/interactors/battery-interactor'
import { LightTypeInteractor } from '../src/properties/interactors/light-type-interactor'
import { MacAddressInteractor } from '../src/properties/interactors/mac-address-interactor'
import { SystemTimeZonesInteractor } from '../src/properties/interactors/system-time-zones-interactor'
import { VersionInteractor } from '../src/properties/interactors/version-interactor'
import { SunriseSunsetCalculator } from '../src/properties/sunrise-sunset-calculator'
import { SettingsService } from '../src/settings/settings.service'

describe('PropertiesController (e2e)', () => {
  const AVAILABLE_TIME_ZONES = ['Europe/Luxembourg', 'Europe/Paris']
  const BATTERY_VOLTAGE = 1.2
  const DEVICE_ID = 'a'
  const LIGHT_TYPE = 'visible'
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
  const USAGE: VersionDto = {
    commitHash: 'abcd',
    version: '1.0.0',
  }

  let app: INestApplication
  let spyCalculateSunriseAndSunset
  let spyGetAvailableTimeZones
  let spyGetBatteryVoltage
  let spyGetFirstMacAddress
  let spyGetLightType
  let spyGetVersion

  beforeAll(() => {
    spyCalculateSunriseAndSunset = jest
      .spyOn(SunriseSunsetCalculator, 'calculateSunriseAndSunset')
      .mockReturnValue(SUNRISE_AND_SUNSET)
    spyGetAvailableTimeZones = jest
      .spyOn(SystemTimeZonesInteractor, 'getAvailableTimeZones')
      .mockResolvedValue(AVAILABLE_TIME_ZONES)
    spyGetBatteryVoltage = jest
      .spyOn(BatteryInteractor, 'getBatteryVoltage')
      .mockResolvedValue(BATTERY_VOLTAGE)
    spyGetFirstMacAddress = jest
      .spyOn(MacAddressInteractor, 'getFirstMacAddress')
      .mockResolvedValue(DEVICE_ID)
    spyGetLightType = jest
      .spyOn(LightTypeInteractor, 'getLightType')
      .mockResolvedValue(LIGHT_TYPE)
    spyGetVersion = jest
      .spyOn(VersionInteractor, 'getVersion')
      .mockResolvedValue(USAGE)
  })

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(SettingsService)
      .useValue({
        getLatitudeAndLongitude: jest
          .fn()
          .mockResolvedValue({ latitude: 1, longitude: 2 }),
      })
      .compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  describe('/properties', () => {
    it('/batteryVoltage (GET)', () => {
      return request(app.getHttpServer())
        .get('/properties/batteryVoltage')
        .expect('Content-Type', /json/)
        .expect(200, { batteryVoltage: BATTERY_VOLTAGE })
    })

    it('/deviceId (GET)', () => {
      return request(app.getHttpServer())
        .get('/properties/deviceId')
        .expect('Content-Type', /json/)
        .expect(200, { deviceId: DEVICE_ID })
    })

    it('/lightType (GET)', () => {
      return request(app.getHttpServer())
        .get('/properties/lightType')
        .expect('Content-Type', /json/)
        .expect(200, { lightType: LIGHT_TYPE })
    })

    it('/sunsetAndSunrise (GET)', () => {
      return request(app.getHttpServer())
        .get('/properties/sunsetAndSunrise')
        .expect('Content-Type', /json/)
        .expect(200, SUNRISE_AND_SUNSET)
    })

    it('/timeZones (GET)', () => {
      return request(app.getHttpServer())
        .get('/properties/timeZones')
        .expect('Content-Type', /json/)
        .expect(200, { timeZones: AVAILABLE_TIME_ZONES })
    })

    it('/version (GET)', async () => {
      const response = await request(app.getHttpServer()).get(
        '/properties/version',
      )
      expect(response.headers['content-type']).toMatch(/json/)
      expect(response.status).toEqual(200)
      expect(response.body).toHaveProperty('commitHash')
      expect(response.body.commitHash).toMatch(/[a-z0-9]{4,}/)
      expect(response.body).toHaveProperty('version')
      expect(response.body.version).toMatch(/[0-9]+.[0-9]+.[0-9]+/)
    })
  })

  afterEach(() => {
    app.close()
  })

  afterAll(() => {
    spyCalculateSunriseAndSunset.mockRestore()
    spyGetAvailableTimeZones.mockRestore()
    spyGetBatteryVoltage.mockRestore()
    spyGetFirstMacAddress.mockRestore()
    spyGetLightType.mockRestore()
    spyGetVersion.mockRestore()
  })
})
