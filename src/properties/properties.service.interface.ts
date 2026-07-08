import { VersionDto } from './dto/version.dto'

export interface IPropertiesService {
  getBatteryVoltage: () => Promise<number>
  getAvailableTimeZones: () => Promise<string[]>
  getDeviceId: () => Promise<string>
  getLightType: () => Promise<string>
  getNextSunsetAndSunrise()
  getVersion: () => Promise<VersionDto>
  isCameraConnected: () => Promise<boolean>
  saveDeviceIdToTextFile: () => Promise<void>
  logVersion: () => Promise<void>
}
