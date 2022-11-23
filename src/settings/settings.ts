export class SettingsFromJsonFile {
  deviceName: string
  siteName: string
}

type ShotType = 'pictures' | 'videos'

export class GeneralSettings extends SettingsFromJsonFile {
  systemTime: string
  timeZone: string
}

export interface Settings {
  camera: {
    pictureQuality: number
    shotTypes: ShotType[]
    videoQuality: number
  }
  general: GeneralSettings
  triggering: {
    sensitivity: number
  }
}

export type PatchableSettings = DeepPartial<Settings>

export interface UpdatableSettings {
  camera: {
    pictureQuality: number
    shotTypes: ShotType[]
    videoQuality: number
  }
  general: GeneralSettings
  triggering: {
    sensitivity: number
  }
}
