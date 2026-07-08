import TriggeringTime from '../shared/entities/triggering-time'
import CoordinatesDto from './dto/coordinates.dto'
import { SettingsPutDto } from './dto/settings.dto'
import {
  LightType,
  PatchableSettings,
  Settings,
  SettingsFromJsonFile,
} from './entities/settings'
import { ShotTypes } from './entities/shot-types'

export interface ISettingsService {
  getAllSettings: () => Promise<Settings>
  updateSettings: (settings: PatchableSettings) => Promise<PatchableSettings>
  updateAllSettings: (settings: SettingsPutDto) => Promise<void>
  getCoordinates: () => Promise<CoordinatesDto>
  storeSettingsFileToShotsFolder: (
    settings: SettingsFromJsonFile,
  ) => Promise<void>
  getShotTypes: () => Promise<ShotTypes>
  getSiteName: () => Promise<string>
  setSiteName(siteName: string): Promise<void>
  getDeviceName: () => Promise<string>
  setDeviceName(deviceName: string): Promise<void>
  setAccessPointNameOrPassword(name: string, password?: string): Promise<void>
  getSystemTime: () => Promise<string>
  setSystemTime(systemTime: string): Promise<void>
  getTimeZone: () => Promise<string>
  setTimeZone(timeZone: string): Promise<void>
  getShotsFolder: () => Promise<string>
  setShotsFolder(path: string): Promise<void>
  getCameraLight: () => Promise<LightType>
  getTriggeringLight: () => Promise<LightType>
  getSleepingTime: () => Promise<TriggeringTime>
  getWakingUpTime: () => Promise<TriggeringTime>
  isTemperatureBelowThreshold(): Promise<boolean>
  getLatitudeAndLongitude: () => Promise<{
    latitude: number
    longitude: number
  }>
  getIsAlternatingLightModeEnabled: () => Promise<boolean>
  getUseSunriseAndSunsetTimes: () => Promise<boolean>
  setNextSunsetForSleepingAndSunriseForWakingUpOnRaspberryPi: () => Promise<void>
  sleepWhenItIsTime: () => Promise<void>
  doAlternatingLightModeChange: () => Promise<void>
}
