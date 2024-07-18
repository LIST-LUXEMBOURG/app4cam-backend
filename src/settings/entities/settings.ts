/**
 * Copyright (C) 2022-2024  Luxembourg Institute of Science and Technology
 *
 * App4Cam is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * App4Cam is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with App4Cam.  If not, see <https://www.gnu.org/licenses/>.
 */
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
  latitude: number
  locationAccuracy: number
  longitude: number
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
