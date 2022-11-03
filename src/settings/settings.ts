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
    shotTypes: ShotType[]
  }
  general: GeneralSettings
  triggering: {
    sensitivity: number
  }
}

export type PatchableSettings = DeepPartial<Settings>

export interface UpdatableSettings {
  camera: {
    shotTypes: ShotType[]
  }
  general: GeneralSettings
  triggering: {
    sensitivity: number
  }
}
