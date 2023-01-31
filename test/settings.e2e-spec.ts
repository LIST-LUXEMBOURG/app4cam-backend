import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import * as request from 'supertest'
import { SystemTimeZonesInteractor } from '../src/properties/interactors/system-time-zones-interactor'
import { SettingsFileProvider } from '../src/settings/settings-file-provider'
import { SystemTimeInteractor } from '../src/settings/system-time-interactor'
import { AppModule } from './../src/app.module'
import { Settings, SettingsFromJsonFile } from 'src/settings/settings'

const MOVIE_QUALITY = 80
const PICTURE_QUALITY = 80
const SHOTS_FOLDER = '/a'
const TRIGGER_SENSITIVITY = 1

jest.mock('../src/motion-client', () => ({
  MotionClient: {
    getHeight: () => 10,
    getWidth: () => 10,
    setFilename: jest.fn(),
    setLeftTextOnImage: jest.fn(),
    getMovieQuality: () => MOVIE_QUALITY,
    setMovieQuality: jest.fn(),
    getMovieOutput: () => 'on',
    setMovieOutput: jest.fn(),
    getPictureQuality: () => PICTURE_QUALITY,
    setPictureQuality: jest.fn(),
    getPictureOutput: () => 'best',
    setPictureOutput: jest.fn(),
    setTargetDir: jest.fn(),
    getThreshold: () => 75,
    setThreshold: jest.fn(),
    getTargetDir: () => SHOTS_FOLDER,
  },
}))

describe('SettingsController (e2e)', () => {
  const AVAILABLE_TIMEZONES = ['Europe/Luxembourg', 'Europe/Paris']
  const SHOT_TYPES = ['pictures' as const, 'videos' as const]
  const SYSTEM_TIME = '2022-01-18T14:48:37+01:00'
  const FILE_SETTINGS: SettingsFromJsonFile = {
    deviceName: 'd',
    siteName: 's',
  }
  const ALL_SETTINGS: Settings = {
    camera: {
      pictureQuality: PICTURE_QUALITY,
      shotTypes: SHOT_TYPES,
      videoQuality: MOVIE_QUALITY,
    },
    general: {
      ...FILE_SETTINGS,
      systemTime: SYSTEM_TIME,
      timeZone: AVAILABLE_TIMEZONES[0],
    },
    triggering: {
      sensitivity: TRIGGER_SENSITIVITY,
    },
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
      .spyOn(SystemTimeZonesInteractor, 'getAvailableTimeZones')
      .mockImplementation(() => Promise.resolve(AVAILABLE_TIMEZONES))
    spyGetTimeZone = jest
      .spyOn(SystemTimeInteractor, 'getTimeZone')
      .mockImplementation(() => Promise.resolve(ALL_SETTINGS.general.timeZone))
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

    it('/ (PATCH) invalid option in shot types', () => {
      return request(app.getHttpServer())
        .patch('/settings')
        .send({
          camera: {
            shotTypes: ['a'],
          },
        })
        .expect(400)
    })

    it('/ (PATCH) invalid value for video quality', () => {
      return request(app.getHttpServer())
        .patch('/settings')
        .send({
          camera: {
            videoQuality: 101,
          },
        })
        .expect(400)
    })

    it('/ (PATCH) invalid value for picture quality', () => {
      return request(app.getHttpServer())
        .patch('/settings')
        .send({
          camera: {
            pictureQuality: -1,
          },
        })
        .expect(400)
    })

    it('/ (PATCH) device name', () => {
      return request(app.getHttpServer())
        .patch('/settings')
        .send({ general: { deviceName: 'a' } })
        .expect(200)
    })

    it('/ (PATCH) invalid space in device ID', () => {
      return request(app.getHttpServer())
        .patch('/settings')
        .send({ general: { deviceName: 'a ' } })
        .expect(400)
    })

    it('/ (PATCH) site name', () => {
      return request(app.getHttpServer())
        .patch('/settings')
        .send({ general: { siteName: 'a' } })
        .expect(200)
    })

    it('/ (PATCH) empty site name', () => {
      return request(app.getHttpServer())
        .patch('/settings')
        .send({ general: { siteName: '' } })
        .expect(200)
    })

    it('/ (PATCH) invalid space in site name', () => {
      return request(app.getHttpServer())
        .patch('/settings')
        .send({ general: { siteName: 'a ' } })
        .expect(400)
    })

    it('/ (PATCH) system time', () => {
      return request(app.getHttpServer())
        .patch('/settings')
        .send({ general: { systemTime: new Date().toISOString() } })
        .expect(200)
    })

    it('/ (PATCH) time zone', () => {
      return request(app.getHttpServer())
        .patch('/settings')
        .send({ general: { timeZone: AVAILABLE_TIMEZONES[0] } })
        .expect(200)
    })

    it('/ (PATCH) trigger sensitivity', () => {
      return request(app.getHttpServer())
        .patch('/settings')
        .send({ triggering: { sensitivity: 1.01 } })
        .expect(200)
    })

    it('/ (PATCH) too low trigger sensitivity', () => {
      return request(app.getHttpServer())
        .patch('/settings')
        .send({ triggering: { sensitivity: 0 } })
        .expect(400)
    })

    it('/ (PATCH) too high trigger sensitivity', () => {
      return request(app.getHttpServer())
        .patch('/settings')
        .send({ triggering: { sensitivity: 10.01 } })
        .expect(400)
    })

    it('/ (PATCH) trigger sensitivity with too many decimals', () => {
      return request(app.getHttpServer())
        .patch('/settings')
        .send({ triggering: { sensitivity: 1.001 } })
        .expect(400)
    })

    it('/ (PUT)', () => {
      return request(app.getHttpServer())
        .put('/settings')
        .send({
          camera: {
            pictureQuality: PICTURE_QUALITY,
            shotTypes: SHOT_TYPES,
            videoQuality: MOVIE_QUALITY,
          },
          general: {
            ...FILE_SETTINGS,
            systemTime: new Date().toISOString(),
            timeZone: ALL_SETTINGS.general.timeZone,
          },
          triggering: {
            sensitivity: TRIGGER_SENSITIVITY,
          },
        })
        .expect(200)
    })

    it('/ (PUT) empty site name', () => {
      return request(app.getHttpServer())
        .put('/settings')
        .send({
          camera: {
            pictureQuality: PICTURE_QUALITY,
            shotTypes: SHOT_TYPES,
            videoQuality: MOVIE_QUALITY,
          },
          general: {
            ...FILE_SETTINGS,
            siteName: '',
            systemTime: new Date().toISOString(),
            timeZone: ALL_SETTINGS.general.timeZone,
          },
          triggering: {
            sensitivity: TRIGGER_SENSITIVITY,
          },
        })
        .expect(200)
    })

    it('/ (PUT) incomplete', () => {
      return request(app.getHttpServer())
        .put('/settings')
        .send({ general: { siteName: 's' } })
        .expect(400)
    })

    it('/ (PUT) empty option in shot types', () => {
      return request(app.getHttpServer())
        .put('/settings')
        .send({
          camera: {
            pictureQuality: PICTURE_QUALITY,
            shotTypes: [''],
            videoQuality: MOVIE_QUALITY,
          },
          general: {
            ...FILE_SETTINGS,
            systemTime: new Date().toISOString(),
          },
          triggering: {
            sensitivity: TRIGGER_SENSITIVITY,
          },
        })
        .expect(400)
    })

    it('/ (PUT) invalid value as video quality', () => {
      return request(app.getHttpServer())
        .put('/settings')
        .send({
          camera: {
            pictureQuality: PICTURE_QUALITY,
            shotTypes: SHOT_TYPES,
            videoQuality: -1,
          },
          general: {
            ...FILE_SETTINGS,
            systemTime: new Date().toISOString(),
          },
          triggering: {
            sensitivity: TRIGGER_SENSITIVITY,
          },
        })
        .expect(400)
    })

    it('/ (PUT) invalid value as picture quality', () => {
      return request(app.getHttpServer())
        .put('/settings')
        .send({
          camera: {
            pictureQuality: 101,
            shotTypes: SHOT_TYPES,
            videoQuality: MOVIE_QUALITY,
          },
          general: {
            ...FILE_SETTINGS,
            systemTime: new Date().toISOString(),
          },
          triggering: {
            sensitivity: TRIGGER_SENSITIVITY,
          },
        })
        .expect(400)
    })

    it('/ (PUT) invalid option in shot types', () => {
      return request(app.getHttpServer())
        .put('/settings')
        .send({
          camera: {
            pictureQuality: PICTURE_QUALITY,
            shotTypes: ['a'],
            videoQuality: MOVIE_QUALITY,
          },
          general: {
            ...FILE_SETTINGS,
            systemTime: new Date().toISOString(),
          },
          triggering: {
            sensitivity: TRIGGER_SENSITIVITY,
          },
        })
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
        .expect(200)
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

    it('/shotsFolder (GET)', async () => {
      return request(app.getHttpServer())
        .get('/settings/shotsFolder')
        .expect('Content-Type', /json/)
        .expect(200, { shotsFolder: SHOTS_FOLDER })
    })

    it('/shotsFolder (PUT)', async () => {
      return request(app.getHttpServer())
        .put('/settings/shotsFolder')
        .send({ shotsFolder: '/media/a' })
        .expect(200)
    })

    it('/shotsFolder (PUT) empty', async () => {
      return request(app.getHttpServer())
        .put('/settings/shotsFolder')
        .send({ shotsFolder: '' })
        .expect(400)
    })

    it('/shotsFolder (PUT) non-media path', async () => {
      return request(app.getHttpServer())
        .put('/settings/shotsFolder')
        .send({ shotsFolder: '/a/b' })
        .expect(403)
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

    it('/timeZone (GET)', () => {
      return request(app.getHttpServer())
        .get('/settings/timeZone')
        .expect('Content-Type', /json/)
        .expect(200, { timeZone: ALL_SETTINGS.general.timeZone })
    })

    it('/timeZone (PUT)', async () => {
      return request(app.getHttpServer())
        .put('/settings/timeZone')
        .send({ timeZone: AVAILABLE_TIMEZONES[0] })
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
