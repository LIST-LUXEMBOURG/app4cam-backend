import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from './../src/app.module'
import { SettingsFileProvider } from '../src/settings/settings-file-provider'
import { Settings, SettingsFromJsonFile } from 'src/settings/settings'
import { SystemTimeInteractor } from '../src/settings/system-time-interactor'

jest.mock('../src/settings/motion-client', () => ({
  MotionClient: {
    setFilename: () => jest.fn(),
  },
}))

describe('AppController (e2e)', () => {
  const SYSTEM_TIME = '2022-01-18T14:48:37+01:00'
  const FILE_SETTINGS: SettingsFromJsonFile = {
    deviceId: 'd',
    siteName: 's',
  }
  const ALL_SETTINGS: Settings = {
    ...FILE_SETTINGS,
    systemTime: SYSTEM_TIME,
  }
  let app: INestApplication
  let spyReadSettingsFile
  let spyWriteSettingsFile
  let spyGetSystemTime

  beforeAll(() => {
    spyReadSettingsFile = jest
      .spyOn(SettingsFileProvider, 'readSettingsFile')
      .mockImplementation(() => {
        return Promise.resolve(FILE_SETTINGS)
      })
    spyWriteSettingsFile = jest
      .spyOn(SettingsFileProvider, 'writeSettingsToFile')
      .mockImplementation(() => {
        return Promise.resolve()
      })
    spyGetSystemTime = jest
      .spyOn(SystemTimeInteractor, 'getSystemTimeInIso8601Format')
      .mockImplementation(() => Promise.resolve(SYSTEM_TIME))
  })

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(new ValidationPipe())
    await app.init()
  })

  describe('/settings', () => {
    it('/ (GET)', () => {
      const expectedData = Buffer.from(JSON.stringify(ALL_SETTINGS))
      return request(app.getHttpServer())
        .get('/settings')
        .expect('Content-Type', /json/)
        .responseType('application/json')
        .expect(200, expectedData)
    })

    it('/ (PATCH)', () => {
      return request(app.getHttpServer())
        .patch('/settings')
        .send({ deviceId: 'a' })
        .expect(200)
    })

    it('/ (PATCH) invalid space in device ID', () => {
      return request(app.getHttpServer())
        .patch('/settings')
        .send({ deviceId: 'a ' })
        .expect(400)
    })

    it('/ (PATCH) invalid space in site name', () => {
      return request(app.getHttpServer())
        .patch('/settings')
        .send({ siteName: 'a ' })
        .expect(400)
    })

    it('/siteName (GET)', () => {
      const expectedData = Buffer.from(
        JSON.stringify({ siteName: FILE_SETTINGS.siteName }),
      )
      return request(app.getHttpServer())
        .get('/settings/siteName')
        .expect('Content-Type', /json/)
        .responseType('application/json')
        .expect(200, expectedData)
    })

    it('/siteName (PUT)', () => {
      return request(app.getHttpServer())
        .put('/settings/siteName')
        .send({ siteName: 'a-0A' })
        .expect(200)
    })

    it('/siteName (PUT) invalid space', () => {
      return request(app.getHttpServer())
        .put('/settings/siteName')
        .send({ siteName: 'a ' })
        .expect(400)
    })

    it('/siteName (PUT) invalid underscore', () => {
      return request(app.getHttpServer())
        .put('/settings/siteName')
        .send({ siteName: 'a_' })
        .expect(400)
    })

    it('/siteName (PUT) empty', async () => {
      return request(app.getHttpServer())
        .put('/settings/siteName')
        .send({ siteName: '' })
        .expect(400)
    })

    it('/deviceId (GET)', () => {
      const expectedData = Buffer.from(
        JSON.stringify({ deviceId: FILE_SETTINGS.deviceId }),
      )
      return request(app.getHttpServer())
        .get('/settings/deviceId')
        .expect('Content-Type', /json/)
        .responseType('application/json')
        .expect(200, expectedData)
    })

    it('/deviceId (PUT)', () => {
      return request(app.getHttpServer())
        .put('/settings/deviceId')
        .send({ deviceId: 'a-0A' })
        .expect(200)
    })

    it('/deviceId (PUT) invalid space', () => {
      return request(app.getHttpServer())
        .put('/settings/deviceId')
        .send({ deviceId: 'a ' })
        .expect(400)
    })

    it('/deviceId (PUT) invalid underscore', () => {
      return request(app.getHttpServer())
        .put('/settings/deviceId')
        .send({ deviceId: 'a_' })
        .expect(400)
    })

    it('/deviceId (PUT) empty', async () => {
      return request(app.getHttpServer())
        .put('/settings/deviceId')
        .send({ deviceId: '' })
        .expect(400)
    })

    it('/systemTime (GET)', () => {
      const expectedData = Buffer.from(
        JSON.stringify({ systemTime: SYSTEM_TIME }),
      )
      return request(app.getHttpServer())
        .get('/settings/systemTime')
        .expect('Content-Type', /json/)
        .responseType('application/json')
        .expect(200, expectedData)
    })

    it('/systemTime (PUT)', async () => {
      return request(app.getHttpServer())
        .put('/settings/systemTime')
        .send({ systemTime: '2022-01-18T14:48:37+01:00' })
        .expect(200)
    })

    it('/systemTime (PUT) empty', async () => {
      return request(app.getHttpServer())
        .put('/settings/systemTime')
        .send({ systemTime: '' })
        .expect(400)
    })

    it('/systemTime (PUT) non-empty', async () => {
      return request(app.getHttpServer())
        .put('/settings/systemTime')
        .send({ systemTime: 'a' })
        .expect(400)
    })
  })

  afterEach(() => {
    app.close()
  })

  afterAll(() => {
    spyReadSettingsFile.mockRestore()
    spyWriteSettingsFile.mockRestore()
    spyGetSystemTime.mockRestore()
  })
})
