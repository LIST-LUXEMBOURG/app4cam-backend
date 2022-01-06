import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from './../src/app.module'
import { SettingsFileProvider } from '../src/settings/settings.file.provider'

describe('AppController (e2e)', () => {
  const SETTINGS = {
    deviceId: 'd',
    siteName: 's',
  }
  let app: INestApplication
  let spyReadSettingsFile
  let spyWriteSettingsFile

  beforeAll(() => {
    spyReadSettingsFile = jest
      .spyOn(SettingsFileProvider, 'readSettingsFile')
      .mockImplementation(() => {
        return Promise.resolve(SETTINGS)
      })
    spyWriteSettingsFile = jest
      .spyOn(SettingsFileProvider, 'writeSettingsToFile')
      .mockImplementation(() => {
        return Promise.resolve()
      })
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
      const expectedData = Buffer.from(JSON.stringify(SETTINGS))
      return request(app.getHttpServer())
        .get('/settings')
        .expect('Content-Type', /json/)
        .responseType('application/json')
        .expect(200, expectedData)
    })

    it('/siteName (GET)', () => {
      const expectedData = Buffer.from(
        JSON.stringify({ siteName: SETTINGS.siteName }),
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
        .send({ siteName: 'a' })
        .expect(200)
    })

    it('/siteName (PUT) empty', async () => {
      return request(app.getHttpServer())
        .put('/settings/siteName')
        .send({ siteName: '' })
        .expect(400)
    })

    it('/deviceId (GET)', () => {
      const expectedData = Buffer.from(
        JSON.stringify({ deviceId: SETTINGS.deviceId }),
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
        .send({ deviceId: 'a' })
        .expect(200)
    })

    it('/deviceId (PUT) empty', async () => {
      return request(app.getHttpServer())
        .put('/settings/deviceId')
        .send({ deviceId: '' })
        .expect(400)
    })
  })

  afterAll(() => {
    spyReadSettingsFile.mockRestore()
    spyWriteSettingsFile.mockRestore()
  })
})
