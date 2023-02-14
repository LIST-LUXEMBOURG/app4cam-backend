export class SettingsFromJsonFile {
  general: GeneralSettingsFromJsonFile
  triggering: TriggeringSettingsFromJsonFile
}

class GeneralSettingsFromJsonFile {
  deviceName: string
  siteName: string
}

class TriggeringSettingsFromJsonFile {
  sleepingTime: string
  wakingUpTime: string
}

type ShotType = 'pictures' | 'videos'

interface CameraSettings {
  pictureQuality: number
  shotTypes: ShotType[]
  videoQuality: number
}

export class GeneralSettings extends GeneralSettingsFromJsonFile {
  systemTime: string
  timeZone: string
}

class TriggeringSettings extends TriggeringSettingsFromJsonFile {
  sensitivity: number
}

export interface Settings {
  camera: CameraSettings
  general: GeneralSettings
  triggering: TriggeringSettings
}

export type PatchableSettings = DeepPartial<Settings>
