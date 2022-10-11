import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator'

type ShotType = 'pictures' | 'videos'

export class SettingsPatchDto {
  @IsOptional()
  @Matches(/^[a-zA-Z0-9-]+$/)
  deviceName?: string

  @IsOptional()
  @Matches(/^[a-zA-Z0-9-]*$/)
  siteName?: string

  @IsArray()
  @Matches(/^(pictures|videos)$/, { each: true })
  @IsOptional()
  shotTypes?: ShotType[]

  @IsOptional()
  @IsDateString()
  systemTime?: string

  @IsOptional()
  @IsString()
  timeZone?: string
}

export class SettingsPutDto {
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9-]+$/)
  deviceName: string

  @IsArray()
  @Matches(/^(pictures|videos)$/, { each: true })
  shotTypes: ShotType[]

  @Matches(/^[a-zA-Z0-9-]*$/)
  siteName: string

  @IsNotEmpty()
  @IsString()
  timeZone: string
}
