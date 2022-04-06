import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator'

export class SettingsPatchDto {
  @IsOptional()
  @Matches(/^[a-zA-Z0-9-]+$/)
  deviceId?: string

  @IsOptional()
  @Matches(/^[a-zA-Z0-9-]+$/)
  siteName?: string

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
  deviceId: string

  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9-]+$/)
  siteName: string

  @IsNotEmpty()
  @IsString()
  timeZone: string
}
