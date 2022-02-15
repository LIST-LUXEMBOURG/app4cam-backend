import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from './../src/app.module'

describe('FilesController (e2e)', () => {
  let app: INestApplication

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
      .responseType('binary')
  })

  it('/files/download (POST)', () => {
    const filenames = ['a.txt', 'b.txt']
    return request(app.getHttpServer())
      .post('/files/download')
      .send({ filenames })
      .expect(201)
      .expect('Content-Type', /application\/zip/)
      .expect('Content-Disposition', /attachment; filename="[a-z0-9]+.zip"/)
      .responseType('binary')
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
})
