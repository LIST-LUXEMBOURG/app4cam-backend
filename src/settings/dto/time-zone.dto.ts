import { IsNotEmpty, IsString } from 'class-validator'

export class TimeZoneDto {
  @IsNotEmpty()
  @IsString()
  timeZone: string
}
