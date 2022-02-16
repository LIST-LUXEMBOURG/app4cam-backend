import { IsDateString, IsOptional, Matches } from 'class-validator'

export class SettingsDto {
  @IsOptional()
  @Matches(/^[a-zA-Z0-9_-]+$/)
  deviceId?: string

  @IsOptional()
  @Matches(/^[a-zA-Z0-9_-]+$/)
  siteName?: string

  @IsOptional()
  @IsDateString()
  systemTime?: string
}
