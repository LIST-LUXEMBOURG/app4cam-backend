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
  IsString,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator'
import { LightType } from '../settings'

type ShotType = 'pictures' | 'videos'

class CameraSettingsPatchDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  pictureQuality: number

  @IsArray()
  @Matches(/^(pictures|videos)$/, { each: true })
  @IsOptional()
  shotTypes?: ShotType[]

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  videoQuality: number
}

class GeneralSettingsPatchDto {
  @IsOptional()
  @Matches(/^[a-zA-Z0-9-]+$/)
  deviceName?: string

  @IsOptional()
  @Matches(/^[a-zA-Z0-9-]*$/)
  siteName?: string

  @IsOptional()
  @IsDateString()
  systemTime?: string

  @IsOptional()
  @IsString()
  timeZone?: string
}

class TriggeringSettingsPatchDto {
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(10)
  sensitivity?: number

  @IsOptional()
  @Matches(/^(([01][0-9]|2[0-3]):[0-5][0-9]|)$/)
  sleepingTime?: string

  @IsOptional()
  @Matches(/^(([01][0-9]|2[0-3]):[0-5][0-9]|)$/)
  wakingUpTime?: string

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

  @Matches(/^[a-zA-Z0-9-]*$/)
  siteName: string

  @IsNotEmpty()
  @IsDateString()
  systemTime: string

  @IsNotEmpty()
  @IsString()
  timeZone: string
}

class TriggeringSettingsPutDto {
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(10)
  sensitivity: number

  @Matches(/^(([01][0-9]|2[0-3]):[0-5][0-9]|)$/)
  sleepingTime: string

  @Matches(/^(([01][0-9]|2[0-3]):[0-5][0-9]|)$/)
  wakingUpTime: string

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
