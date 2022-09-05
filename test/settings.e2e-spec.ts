import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from './../src/app.module'
import { SettingsFileProvider } from '../src/settings/settings-file-provider'
import { Settings, SettingsFromJsonFile } from 'src/settings/settings'
import { SystemTimeInteractor } from '../src/settings/system-time-interactor'

jest.mock('../src/motion-client', () => ({
  MotionClient: {
    setFilename: jest.fn(),
    setLeftTextOnImage: jest.fn(),
    getMovieOutput: () => 'on',
    setMovieOutput: jest.fn(),
    getPictureOutput: () => 'on',
    setPictureOutput: jest.fn(),
  },
}))

describe('SettingsController (e2e)', () => {
  const AVAILABLE_TIMEZONES = ['Europe/Luxembourg', 'Europe/Paris']
  const SHOT_TYPES = ['pictures' as const, 'videos' as const]
  const SYSTEM_TIME = '2022-01-18T14:48:37+01:00'
  const FILE_SETTINGS: SettingsFromJsonFile = {
    deviceName: 'd',
    siteName: 's',
    timeZone: AVAILABLE_TIMEZONES[0],
  }
  const ALL_SETTINGS: Settings = {
    ...FILE_SETTINGS,
    shotTypes: SHOT_TYPES,
    systemTime: SYSTEM_TIME,
  }

  let app: INestApplication
  let spyReadSettingsFile
  let spyWriteSettingsFile
  let spyGetSystemTime
  let spySetSystemTime
  let spyGetAvailableTimeZones
  let spyGetTimeZone
  let spySetTimeZone

  beforeAll(() => {
    spyReadSettingsFile = jest
      .spyOn(SettingsFileProvider, 'readSettingsFile')
      .mockImplementation(() => Promise.resolve(FILE_SETTINGS))
    spyWriteSettingsFile = jest
      .spyOn(SettingsFileProvider, 'writeSettingsToFile')
      .mockImplementation(() => Promise.resolve())
    spyGetSystemTime = jest
      .spyOn(SystemTimeInteractor, 'getSystemTimeInIso8601Format')
      .mockImplementation(() => Promise.resolve(SYSTEM_TIME))
    spySetSystemTime = jest
      .spyOn(SystemTimeInteractor, 'setSystemTimeInIso8601Format')
      .mockImplementation(() => Promise.resolve())
    spyGetAvailableTimeZones = jest
      .spyOn(SystemTimeInteractor, 'getAvailableTimeZones')
      .mockImplementation(() => Promise.resolve(AVAILABLE_TIMEZONES))
    spyGetTimeZone = jest
      .spyOn(SystemTimeInteractor, 'getTimeZone')
      .mockImplementation(() => Promise.resolve(FILE_SETTINGS.timeZone))
    spySetTimeZone = jest
      .spyOn(SystemTimeInteractor, 'setTimeZone')
      .mockImplementation(() => Promise.resolve())
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
      return request(app.getHttpServer())
        .get('/settings')
        .expect('Content-Type', /json/)
        .expect(200, ALL_SETTINGS)
    })

    it('/ (PATCH)', () => {
      return request(app.getHttpServer())
        .patch('/settings')
        .send({ deviceName: 'a' })
        .expect(200)
    })

    it('/ (PATCH) invalid space in device ID', () => {
      return request(app.getHttpServer())
        .patch('/settings')
        .send({ deviceName: 'a ' })
        .expect(400)
    })

    it('/ (PATCH) invalid space in site name', () => {
      return request(app.getHttpServer())
        .patch('/settings')
        .send({ siteName: 'a ' })
        .expect(400)
    })

    it('/ (PATCH) invalid option in shot types', () => {
      return request(app.getHttpServer())
        .patch('/settings')
        .send({ shotTypes: ['a'] })
        .expect(400)
    })

    it('/ (PUT)', () => {
      return request(app.getHttpServer())
        .put('/settings')
        .send({ ...FILE_SETTINGS, shotTypes: SHOT_TYPES })
        .expect(200)
    })

    it('/ (PUT) incomplete', () => {
      return request(app.getHttpServer())
        .put('/settings')
        .send({ siteName: 's' })
        .expect(400)
    })

    it('/ (PUT) empty option in shot types', () => {
      return request(app.getHttpServer())
        .put('/settings')
        .send({ ...FILE_SETTINGS, shotTypes: [''] })
        .expect(400)
    })

    it('/ (PUT) invalid option in shot types', () => {
      return request(app.getHttpServer())
        .put('/settings')
        .send({ ...FILE_SETTINGS, shotTypes: ['a'] })
        .expect(400)
    })

    it('/siteName (GET)', () => {
      return request(app.getHttpServer())
        .get('/settings/siteName')
        .expect('Content-Type', /json/)
        .expect(200, { siteName: FILE_SETTINGS.siteName })
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

    it('/deviceName (GET)', () => {
      return request(app.getHttpServer())
        .get('/settings/deviceName')
        .expect('Content-Type', /json/)
        .expect(200, { deviceName: FILE_SETTINGS.deviceName })
    })

    it('/deviceName (PUT)', () => {
      return request(app.getHttpServer())
        .put('/settings/deviceName')
        .send({ deviceName: 'a-0A' })
        .expect(200)
    })

    it('/deviceName (PUT) invalid space', () => {
      return request(app.getHttpServer())
        .put('/settings/deviceName')
        .send({ deviceName: 'a ' })
        .expect(400)
    })

    it('/deviceName (PUT) invalid underscore', () => {
      return request(app.getHttpServer())
        .put('/settings/deviceName')
        .send({ deviceName: 'a_' })
        .expect(400)
    })

    it('/deviceName (PUT) empty', async () => {
      return request(app.getHttpServer())
        .put('/settings/deviceName')
        .send({ deviceName: '' })
        .expect(400)
    })

    it('/systemTime (GET)', () => {
      return request(app.getHttpServer())
        .get('/settings/systemTime')
        .expect('Content-Type', /json/)
        .expect(200, { systemTime: SYSTEM_TIME })
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

    it('/timeZones (GET)', () => {
      return request(app.getHttpServer())
        .get('/settings/timeZones')
        .expect('Content-Type', /json/)
        .expect(200, { timeZones: AVAILABLE_TIMEZONES })
    })

    it('/timeZone (GET)', () => {
      return request(app.getHttpServer())
        .get('/settings/timeZone')
        .expect('Content-Type', /json/)
        .expect(200, { timeZone: FILE_SETTINGS.timeZone })
    })

    it('/timeZone (PUT)', async () => {
      return request(app.getHttpServer())
        .put('/settings/timeZone')
        .send({ timeZone: 'Europe/Luxembourg' })
        .expect(200)
    })

    it('/timeZone (PUT) empty', async () => {
      return request(app.getHttpServer())
        .put('/settings/timeZone')
        .send({ timeZone: '' })
        .expect(400)
    })

    it('/timeZone (PUT) non-supported', async () => {
      return request(app.getHttpServer())
        .put('/settings/timeZone')
        .send({ timeZone: 'a' })
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
    spySetSystemTime.mockRestore()
    spyGetAvailableTimeZones.mockRestore()
    spyGetTimeZone.mockRestore()
    spySetTimeZone.mockRestore()
  })
})
