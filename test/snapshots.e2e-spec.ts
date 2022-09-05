import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import * as request from 'supertest'
import { AppModule } from '../src/app.module'

jest.mock('../src/motion-client', () => ({
  MotionClient: {
    takeSnapshot: () => jest.fn(),
  },
}))

describe('SnapshotsController (e2e)', () => {
  let app: INestApplication

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  it('/snapshots (GET)', () => {
    return request(app.getHttpServer())
      .get('/snapshots')
      .expect(200)
      .expect('Content-Type', 'image/jpeg')
      .expect(
        'Content-Disposition',
        'attachment; filename="latest_snapshot.jpg"',
      )
      .responseType('blob')
  })

  afterEach(() => {
    app.close()
  })
})
