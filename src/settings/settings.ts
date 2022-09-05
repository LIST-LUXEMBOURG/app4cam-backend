export class SettingsFromJsonFile {
  deviceName: string
  siteName: string
  timeZone: string
}

type ShotType = 'pictures' | 'videos'

export class Settings extends SettingsFromJsonFile {
  shotTypes: ShotType[]
  systemTime: string
}

export type PatchableSettings = Partial<Settings>

export type UpdatableSettings = Omit<Settings, 'systemTime'>
