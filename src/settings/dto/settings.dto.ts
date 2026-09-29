/**
 * Copyright (C) since 2022 Luxembourg Institute of Science and Technology
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
import { Type } from 'class-transformer'
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsObject,
  IsOptional,
  IsTimeZone,
  Matches,
  Max,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator'
import type { LightType } from '../entities/settings.js'

type ShotType = 'pictures' | 'videos'

export class TriggeringTimeDto {
  @IsNotEmpty()
  @Min(0)
  @Max(23)
  hour: number

  @IsNotEmpty()
  @Min(0)
  @Max(59)
  minute: number
}

class CameraSettingsPatchDto {
  @IsOptional()
  @Matches(/^(infrared|visible)$/)
  light?: LightType

  @IsOptional()
  @IsInt()
  @Min(0)
  focus?: number

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  pictureQuality?: number

  @IsArray()
  @Matches(/^(pictures|videos)$/, { each: true })
  @IsOptional()
  shotTypes?: ShotType[]

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  videoQuality?: number
}

class GeneralSettingsPatchDto {
  @IsOptional()
  @Matches(/^[a-zA-Z0-9-]+$/)
  deviceName?: string

  @IsOptional()
  @IsBoolean()
  isAlternatingLightModeEnabled?: boolean

  @IsOptional()
  @ValidateIf((o) => o.latitude !== null)
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number | null

  @IsOptional()
  @ValidateIf((o) => o.locationAccuracy !== null)
  @IsNumber()
  @Min(0)
  locationAccuracy?: number | null

  @IsOptional()
  @ValidateIf((o) => o.longitude !== null)
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number | null

  @IsOptional()
  @Matches(/^[ -~]{8,63}$/)
  password?: string

  @IsOptional()
  @Matches(/^[a-zA-Z0-9-]*$/)
  siteName?: string

  @IsOptional()
  @IsDateString()
  systemTime?: string

  @IsOptional()
  @IsTimeZone()
  timeZone?: string
}

class TriggeringSettingsPatchDto {
  @IsOptional()
  @Matches(/^(infrared|visible)$/)
  light?: LightType

  @IsOptional()
  @IsInt()
  temperatureThreshold?: number | null

  @IsOptional()
  @IsInt()
  @Min(1)
  threshold?: number

  @IsOptional()
  @Type(() => TriggeringTimeDto)
  @ValidateNested()
  sleepingTime?: TriggeringTimeDto | null

  @IsOptional()
  @IsBoolean()
  useSunriseAndSunsetTimes?: boolean

  @IsOptional()
  @Type(() => TriggeringTimeDto)
  @ValidateNested()
  wakingUpTime?: TriggeringTimeDto | null
}

export class SettingsPatchDto {
  @IsObject()
  @IsOptional()
  @Type(() => CameraSettingsPatchDto)
  @ValidateNested()
  camera?: CameraSettingsPatchDto

  @IsObject()
  @IsOptional()
  @Type(() => GeneralSettingsPatchDto)
  @ValidateNested()
  general?: GeneralSettingsPatchDto

  @IsObject()
  @IsOptional()
  @Type(() => TriggeringSettingsPatchDto)
  @ValidateNested()
  triggering?: TriggeringSettingsPatchDto
}

export class CameraSettingsPutDto {
  @Matches(/^(infrared|visible)$/)
  light: LightType

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  focus: number

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Max(100)
  pictureQuality: number

  @IsArray()
  @Matches(/^(pictures|videos)$/, { each: true })
  shotTypes: ShotType[]

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Max(100)
  videoQuality: number
}

export class GeneralSettingsPutDto {
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9-]+$/)
  deviceName: string

  @IsNotEmpty()
  @IsBoolean()
  isAlternatingLightModeEnabled: boolean

  @IsNotEmpty()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  locationAccuracy?: number

  @IsNotEmpty()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number

  @IsNotEmpty()
  @Matches(/^[ -~]{8,63}$/)
  password: string

  @Matches(/^[a-zA-Z0-9-]*$/)
  siteName: string

  @IsNotEmpty()
  @IsDateString()
  systemTime: string

  @IsNotEmpty()
  @IsTimeZone()
  timeZone: string
}

export class TriggeringSettingsPutDto {
  @Matches(/^(infrared|visible)$/)
  light: LightType

  @IsNotEmpty()
  @IsInt()
  temperatureThreshold: number

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  threshold: number

  @IsObject()
  @IsNotEmptyObject()
  @Type(() => TriggeringTimeDto)
  @ValidateNested()
  sleepingTime: TriggeringTimeDto

  @IsNotEmpty()
  @IsBoolean()
  useSunriseAndSunsetTimes: boolean

  @IsObject()
  @IsNotEmptyObject()
  @Type(() => TriggeringTimeDto)
  @ValidateNested()
  wakingUpTime: TriggeringTimeDto
}

export class SettingsPutDto {
  @IsObject()
  @IsNotEmptyObject()
  @Type(() => CameraSettingsPutDto)
  @ValidateNested()
  camera: CameraSettingsPutDto

  @IsObject()
  @IsNotEmptyObject()
  @Type(() => GeneralSettingsPutDto)
  @ValidateNested()
  general: GeneralSettingsPutDto

  @IsObject()
  @IsNotEmptyObject()
  @Type(() => TriggeringSettingsPutDto)
  @ValidateNested()
  triggering: TriggeringSettingsPutDto
}
