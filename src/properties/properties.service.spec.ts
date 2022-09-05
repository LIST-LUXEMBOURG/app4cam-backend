import { Test, TestingModule } from '@nestjs/testing'
import { VersionDto } from './dto/version.dto'
import { MacAddressInteractor } from './interactors/mac-address-interactor'
import { VersionInteractor } from './interactors/version-interactor'
import { PropertiesService } from './properties.service'

const DEVICE_ID = 'a'

const VERSION: VersionDto = {
  commitHash: 'a',
  version: 'b',
}

describe(PropertiesService.name, () => {
  let service: PropertiesService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PropertiesService],
    }).compile()

    service = module.get<PropertiesService>(PropertiesService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
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
})
