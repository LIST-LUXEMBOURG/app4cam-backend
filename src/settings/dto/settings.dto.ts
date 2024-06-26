// © 2022-2024 Luxembourg Institute of Science and Technology
import { Type } from 'class-transformer'
import {
  IsArray,
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
  ValidateNested,
} from 'class-validator'
import { LightType } from '../entities/settings'

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
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number

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
  @IsInt()
  temperatureThreshold?: number | null

  @IsOptional()
  @IsInt()
  @Min(1)
  threshold?: number

  @IsOptional()
  sleepingTime?: TriggeringTimeDto | null

  @IsOptional()
  wakingUpTime?: TriggeringTimeDto | null

  @IsOptional()
  @Matches(/^(infrared|visible)$/)
  light?: LightType
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
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number

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
  @IsNotEmpty()
  @IsInt()
  temperatureThreshold: number

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  threshold: number

  @IsNotEmpty()
  sleepingTime: TriggeringTimeDto

  @IsNotEmpty()
  wakingUpTime: TriggeringTimeDto

  @Matches(/^(infrared|visible)$/)
  light: LightType
}

export class SettingsPutDto {
  @IsObject()
  @IsNotEmpty()
  @IsNotEmptyObject()
  @Type(() => CameraSettingsPutDto)
  @ValidateNested()
  camera: CameraSettingsPutDto

  @IsObject()
  @IsNotEmpty()
  @IsNotEmptyObject()
  @Type(() => GeneralSettingsPutDto)
  @ValidateNested()
  general: GeneralSettingsPutDto

  @IsObject()
  @IsNotEmpty()
  @IsNotEmptyObject()
  @Type(() => TriggeringSettingsPutDto)
  @ValidateNested()
  triggering: TriggeringSettingsPutDto
}
