// © 2022-2024 Luxembourg Institute of Science and Technology
export class SettingsFromJsonFile {
  camera: CameraSettingsFromJsonFile
  general: Partial<GeneralSettingsFromJsonFile>
  triggering: Partial<TriggeringSettingsFromJsonFile> &
    Pick<CameraSettingsFromJsonFile, 'light'>
}

export type LightType = 'infrared' | 'visible'

export interface TriggeringTime {
  hour: number
  minute: number
}

interface CameraSettingsFromJsonFile {
  light: LightType
}

class GeneralSettingsFromJsonFile {
  deviceName: string
  siteName: string
}

class TriggeringSettingsFromJsonFile {
  light: LightType
  sleepingTime: TriggeringTime
  temperatureThreshold: number
  wakingUpTime: TriggeringTime
}

type ShotType = 'pictures' | 'videos'

export interface CameraSettings extends CameraSettingsFromJsonFile {
  isLightEnabled: boolean
  focus: number
  focusMaximum: number
  focusMinimum: number
  pictureQuality: number
  shotTypes: ShotType[]
  videoQuality: number
}

export class GeneralSettings extends GeneralSettingsFromJsonFile {
  password: string
  systemTime: string
  timeZone: string
}

export class TriggeringSettings extends TriggeringSettingsFromJsonFile {
  isLightEnabled: boolean
  isTemperatureThresholdEnabled: boolean
  threshold: number
  thresholdMaximum: number
}

export interface Settings {
  camera: CameraSettings
  general: GeneralSettings
  triggering: TriggeringSettings
}

export interface PatchableSettings {
  camera?: Partial<CameraSettings>
  general?: Partial<GeneralSettings>
  triggering?: Partial<TriggeringSettings>
}
