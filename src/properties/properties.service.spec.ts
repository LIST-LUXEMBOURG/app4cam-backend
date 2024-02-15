// © 2022-2024 Luxembourg Institute of Science and Technology
import { Test, TestingModule } from '@nestjs/testing'
import { VersionDto } from './dto/version.dto'
import { MacAddressInteractor } from './interactors/mac-address-interactor'
import { SystemTimeZonesInteractor } from './interactors/system-time-zones-interactor'
import { VersionInteractor } from './interactors/version-interactor'
import { PropertiesService } from './properties.service'

const AVAILABLE_TIME_ZONES = ['t1', 't2']

const DEVICE_ID = 'a'

const VERSION: VersionDto = {
  commitHash: 'a',
  version: 'b',
}

describe(PropertiesService.name, () => {
  let service: PropertiesService

  let spyGetAvailableTimeZones

  beforeAll(() => {
    spyGetAvailableTimeZones = jest
      .spyOn(SystemTimeZonesInteractor, 'getAvailableTimeZones')
      .mockImplementation(() => Promise.resolve(AVAILABLE_TIME_ZONES))
  })

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PropertiesService],
    }).compile()

    service = module.get<PropertiesService>(PropertiesService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('returns available time zones', async () => {
    const timeZones = await service.getAvailableTimeZones()
    expect(timeZones).toBe(AVAILABLE_TIME_ZONES)
  })

  it('gets the device ID', async () => {
    const spyGetDeviceId = jest
      .spyOn(MacAddressInteractor, 'getFirstMacAddress')
      .mockResolvedValue(DEVICE_ID)
    const response = await service.getDeviceId()
    expect(response).toEqual({ deviceId: DEVICE_ID })
    spyGetDeviceId.mockRestore()
  })

  it('gets the version', async () => {
    const spyGetVersion = jest
      .spyOn(VersionInteractor, 'getVersion')
      .mockImplementation(() => {
        return Promise.resolve(VERSION)
      })
    const response = await service.getVersion()
    expect(response).toEqual(VERSION)
    spyGetVersion.mockRestore()
  })

  afterAll(() => {
    spyGetAvailableTimeZones.mockRestore()
  })
})
