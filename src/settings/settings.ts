export class SettingsFromJsonFile {
  camera: CameraSettingsFromJsonFile
  general: GeneralSettingsFromJsonFile
  triggering: TriggeringSettingsFromJsonFile
}

export type LightType = 'infrared' | 'visible'

interface CameraSettingsFromJsonFile {
  light: LightType
}

class GeneralSettingsFromJsonFile {
  deviceName: string
  siteName: string
}

class TriggeringSettingsFromJsonFile {
  light: LightType
  sleepingTime: string
  wakingUpTime: string
}

type ShotType = 'pictures' | 'videos'

export interface CameraSettings extends CameraSettingsFromJsonFile {
  focus: number
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
  threshold: number
}

export interface Settings {
  camera: CameraSettings
  general: GeneralSettings
  triggering: TriggeringSettings
}

export type PatchableSettings = DeepPartial<Settings>
