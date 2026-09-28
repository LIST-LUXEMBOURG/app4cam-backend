import { SunriseAndSunsetDto } from '../shared/entities/sunrise-and-sunset.dto.js'
import { VersionDto } from './dto/version.dto.js'

export interface IPropertiesService {
  getBatteryVoltage: () => Promise<number>
  getAvailableTimeZones: () => Promise<string[]>
  getDeviceId: () => Promise<string>
  getLightType: () => Promise<string>
  getNextSunsetAndSunrise: () => Promise<SunriseAndSunsetDto>
  getVersion: () => Promise<VersionDto>
  isCameraConnected: () => Promise<boolean | null>
  saveDeviceIdToTextFile: () => Promise<void>
  logVersion: () => Promise<void>
}
