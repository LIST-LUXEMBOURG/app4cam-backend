import { Test, TestingModule } from '@nestjs/testing'
import { SettingsFileProvider } from './settings.file.provider'
import { SettingsService } from './settings.service'

describe('SettingsService', () => {
  let service: SettingsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SettingsService],
    }).compile()

    service = module.get<SettingsService>(SettingsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should return site name', async () => {
    const spy = jest
      .spyOn(SettingsFileProvider, 'readSettingsFile')
      .mockImplementation(() => {
        return Promise.resolve({ siteName: 'a' })
      })
    const siteName = await service.getSiteName()
    expect(siteName).toBe('a')
    spy.mockRestore()
  })

  it('should set site name', async () => {
    const spy = jest.spyOn(SettingsFileProvider, 'writeSettingsToFile')
    await service.setSiteName('a')
    expect(spy).toHaveBeenCalledWith(expect.any(Object), expect.any(String))
    spy.mockRestore()
  })
})
