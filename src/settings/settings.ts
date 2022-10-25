export class SettingsFromJsonFile {
  deviceName: string
  siteName: string
  timeZone: string
}

type ShotType = 'pictures' | 'videos'

export class GeneralSettings extends SettingsFromJsonFile {
  systemTime: string
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
  general: SettingsFromJsonFile
  triggering: {
    sensitivity: number
  }
}
