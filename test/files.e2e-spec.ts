import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from './../src/app.module'
import { SettingsFileProvider } from '../src/settings/settings-file-provider'
import { SettingsFromJsonFile } from '../src/settings/settings'
import { writeFile } from 'fs/promises'

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

  it('/files (POST)', () => {
    const filenames = ['a.txt', 'b.txt']
    return request(app.getHttpServer())
      .post('/files')
      .send({ filenames })
      .expect(201)
      .expect('Content-Type', /application\/zip/)
      .expect(
        'Content-Disposition',
        /attachment; filename="[A-Za-z0-9]+_[A-Za-z0-9]+_[TZ0-9]+.zip"/,
      )
      .responseType('blob')
  })

  it('/files (POST) non-existing file', () => {
    const filenames = ['a.txt', 'c.txt']
    return request(app.getHttpServer())
      .post('/files')
      .send({ filenames })
      .expect(404)
  })

  it('/files (POST) illegal path', () => {
    const filenames = ['../whatever-file-in-different-folder.txt']
    return request(app.getHttpServer())
      .post('/files')
      .send({ filenames })
      .expect(403)
  })

  it('/files (GET)', () => {
    return request(app.getHttpServer())
      .get('/files')
      .expect(200)
      .expect('Content-Type', /json/)
      .responseType('application/json')
  })

  it('/files (DELETE)', async () => {
    const filenames = ['to-delete-1.txt', 'to-delete-2.txt']
    for (const filename of filenames) {
      const filePath = process.env.FILES_FOLDER_PATH + filename
      await writeFile(filePath, 'bla')
    }
    return request(app.getHttpServer())
      .delete('/files')
      .send({ filenames })
      .expect(200)
      .expect('Content-Type', /json/)
      .responseType('application/json')
      .expect(
        Buffer.from(
          JSON.stringify({ 'to-delete-1.txt': true, 'to-delete-2.txt': true }),
        ),
      )
  })

  it('/files (DELETE)', async () => {
    const filenames = ['../whatever-file-in-different-folder.txt']
    return request(app.getHttpServer())
      .delete('/files')
      .send({ filenames })
      .expect(403)
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

  it('/files/:id (DELETE)', async () => {
    const filename = 'to-delete.txt'
    const filePath = process.env.FILES_FOLDER_PATH + filename
    await writeFile(filePath, 'bla')
    return request(app.getHttpServer())
      .delete('/files/' + filename)
      .expect(200)
  })

  afterEach(() => {
    app.close()
  })

  afterAll(() => {
    spyReadSettingsFile.mockRestore()
  })
})
