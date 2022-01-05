import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from './../src/app.module'

describe('AppController (e2e)', () => {
  let app: INestApplication

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(new ValidationPipe())
    await app.init()
  })

  describe('/settings', () => {
    it('/siteName (GET)', (done) => {
      request(app.getHttpServer())
        .get('/settings/siteName')
        .expect(200)
        .expect('Content-Type', /json/)
        .responseType('application/json')
        .then((response) => {
          const data = JSON.parse(response.body)
          expect(
            Object.prototype.hasOwnProperty.call(data, 'siteName'),
          ).toBeTruthy()
          done()
        })
    })

    it('/siteName (PATCH)', () => {
      return request(app.getHttpServer())
        .patch('/settings/siteName')
        .send({ siteName: 'a' })
        .expect(200)
    })

    it('/siteName (PATCH) empty', async () => {
      return request(app.getHttpServer())
        .patch('/settings/siteName')
        .send({ siteName: '' })
        .expect(400)
    })
  })
})
