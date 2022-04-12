import { Test, TestingModule } from '@nestjs/testing'
import { VersionInteractor } from './version-interactor'
import { VersionDto } from './version.dto'
import { VersionService } from './version.service'

const VERSION: VersionDto = {
  commitHash: 'a',
  version: 'b',
}

describe(VersionService.name, () => {
  let service: VersionService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VersionService],
    }).compile()

    service = module.get<VersionService>(VersionService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
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
