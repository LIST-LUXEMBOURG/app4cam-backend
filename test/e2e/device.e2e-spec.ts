/**
 * Copyright (C) since 2026 Luxembourg Institute of Science and Technology
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
import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import request from 'supertest'
import { AppModule } from '../../src/app.module'
import { DeviceService } from '../../src/device/device.service'
import { IDeviceService } from '../../src/device/device.service.interface'

describe('DeviceController (e2e)', () => {
  class MockDeviceService implements IDeviceService {
    reboot = async () => {}
    shutDown = async () => {}
  }

  let app: INestApplication

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DeviceService)
      .useClass(MockDeviceService)
      .overrideProvider('SCHEDULE_MODULE_OPTIONS')
      .useValue({ cronJobs: false, intervals: false, timeouts: false })
      .compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(new ValidationPipe())
    await app.init()
  })

  describe('/device/', () => {
    it('/reboot (POST)', () => {
      return request(app.getHttpServer()).post('/device/reboot').expect(200)
    })

    it('/shutDown (POST)', () => {
      return request(app.getHttpServer()).post('/device/shutDown').expect(200)
    })
  })

  afterEach(async () => {
    await app.close()
  })
})
