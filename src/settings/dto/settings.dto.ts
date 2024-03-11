// © 2022-2024 Luxembourg Institute of Science and Technology
import { Type } from 'class-transformer'
import {
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsOptional,
  IsTimeZone,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator'
import { LightType } from '../settings'

type ShotType = 'pictures' | 'videos'

class TriggeringTimeDto {
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
  @Min(1)
  @Max(2147483647)
  threshold?: number

  @IsOptional()
  sleepingTime?: TriggeringTimeDto

  @IsOptional()
  wakingUpTime?: TriggeringTimeDto

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

class CameraSettingsPutDto {
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

class GeneralSettingsPutDto {
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9-]+$/)
  deviceName: string

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

class TriggeringSettingsPutDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(2147483647)
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
