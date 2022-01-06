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

  describe('with mocked SettingsFileProvider', () => {
    const SETTINGS = {
      deviceId: 'd',
      siteName: 's',
    }
    let spyReadSettingsFile
    let spyWriteSettingsFile

    beforeAll(() => {
      spyReadSettingsFile = jest
        .spyOn(SettingsFileProvider, 'readSettingsFile')
        .mockImplementation(() => {
          return Promise.resolve(SETTINGS)
        })
      spyWriteSettingsFile = jest
        .spyOn(SettingsFileProvider, 'writeSettingsToFile')
        .mockImplementation(() => {
          return Promise.resolve()
        })
    })

    it('should get all settings', async () => {
      const settings = await service.getAllSettings()
      expect(settings).toBe(SETTINGS)
    })

    it('should return site name', async () => {
      const siteName = await service.getSiteName()
      expect(siteName).toBe('s')
    })

    it('should set site name', async () => {
      await service.setSiteName('a')
      expect(spyWriteSettingsFile).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(String),
      )
    })

    it('should return device ID', async () => {
      const siteName = await service.getDeviceId()
      expect(siteName).toBe('d')
    })

    it('should set device ID', async () => {
      await service.setDeviceId('b')
      expect(spyWriteSettingsFile).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(String),
      )
    })

    afterAll(() => {
      spyReadSettingsFile.mockRestore()
      spyWriteSettingsFile.mockRestore()
    })
  })
})
