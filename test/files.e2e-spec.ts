import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from './../src/app.module'
import { writeFile } from 'fs/promises'
import { SettingsService } from '../src/settings/settings.service'

describe('FilesController (e2e)', () => {
  let app: INestApplication

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(SettingsService)
      .useValue({
        getAllSettings: jest.fn(() =>
          Promise.resolve({
            deviceId: 'd',
            siteName: 's',
          }),
        ),
      })
      .compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(new ValidationPipe())
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
      .expect(201)
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
      .expect({ 'to-delete-1.txt': true, 'to-delete-2.txt': true })
  })

  it('/files (DELETE) first one does not exist', async () => {
    const filenames = ['non-existing.txt', 'existing.txt']
    const filePath = process.env.FILES_FOLDER_PATH + filenames[1]
    await writeFile(filePath, 'bla')
    return request(app.getHttpServer())
      .delete('/files')
      .send({ filenames })
      .expect(200)
      .expect('Content-Type', /json/)
      .expect({ 'non-existing.txt': false, 'existing.txt': true })
  })

  it('/files (DELETE) non-existing', async () => {
    const filenames = ['non-existing-1.txt', 'non-existing-2.txt']
    return request(app.getHttpServer())
      .delete('/files')
      .send({ filenames })
      .expect(404)
  })

  it('/files (DELETE) different folder', async () => {
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

  it('/files/:id (DELETE) non-existing', async () => {
    const filename = 'non-existing.txt'
    return request(app.getHttpServer())
      .delete('/files/' + filename)
      .expect(404)
  })

  afterEach(() => {
    app.close()
  })
})
