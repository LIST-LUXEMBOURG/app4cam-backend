import { IsDateString, IsOptional, Matches } from 'class-validator'

export class SettingsDto {
  @IsOptional()
  @Matches(/^[a-zA-Z0-9-]+$/)
  deviceId?: string

  @IsOptional()
  @Matches(/^[a-zA-Z0-9-]+$/)
  siteName?: string

  @IsOptional()
  @IsDateString()
  systemTime?: string
}
