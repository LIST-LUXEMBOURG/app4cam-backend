import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from './../src/app.module'
import { SettingsFileProvider } from '../src/settings/settings-file-provider'
import { SettingsFromJsonFile } from '../src/settings/settings'

describe('FilesController (e2e)', () => {
  const FILE_SETTINGS: SettingsFromJsonFile = {
    deviceId: 'd',
    siteName: 's',
  }
  let app: INestApplication
  let spyReadSettingsFile

  beforeAll(() => {
    spyReadSettingsFile = jest
      .spyOn(SettingsFileProvider, 'readSettingsFile')
      .mockImplementation(() => {
        return Promise.resolve(FILE_SETTINGS)
      })
  })

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  it('/files (GET)', () => {
    return request(app.getHttpServer())
      .get('/files')
      .expect(200)
      .expect('Content-Type', /json/)
      .responseType('application/json')
  })

  it('/files/:id (GET)', () => {
    const filename = 'a.txt'
    return request(app.getHttpServer())
      .get('/files/' + filename)
      .expect(200)
      .expect('Content-Type', /text\/plain/)
      .expect('Content-Disposition', `attachment; filename="${filename}"`)
      .responseType('blob')
  })

  it('/files/download (POST)', () => {
    const filenames = ['a.txt', 'b.txt']
    return request(app.getHttpServer())
      .post('/files/download')
      .send({ filenames })
      .expect(201)
      .expect('Content-Type', /application\/zip/)
      .expect(
        'Content-Disposition',
        /attachment; filename="[A-Za-z0-9]+_[A-Za-z0-9]+_[TZ0-9]+.zip"/,
      )
      .responseType('blob')
  })

  it('/files/download (POST)', () => {
    const filenames = ['a.txt', 'c.txt']
    return request(app.getHttpServer())
      .post('/files/download')
      .send({ filenames })
      .expect(404)
  })

  it('/files/download (POST)', () => {
    const filenames = ['../whatever-file-in-different-folder.txt']
    return request(app.getHttpServer())
      .post('/files/download')
      .send({ filenames })
      .expect(403)
  })

  afterEach(() => {
    app.close()
  })

  afterAll(() => {
    spyReadSettingsFile.mockRestore()
  })
})
