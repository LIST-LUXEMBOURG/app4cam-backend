export class SettingsFromJsonFile {
  deviceName: string
  siteName: string
  timeZone: string
}

export class Settings extends SettingsFromJsonFile {
  systemTime: string
}
