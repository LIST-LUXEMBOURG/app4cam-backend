export class SettingsFromJsonFile {
  deviceId: string
  siteName: string
  timeZone: string
}

export class Settings extends SettingsFromJsonFile {
  systemTime: string
}
