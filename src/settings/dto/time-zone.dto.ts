import { IsNotEmpty, IsTimeZone } from 'class-validator'

export class TimeZoneDto {
  @IsNotEmpty()
  @IsTimeZone()
  timeZone: string
}
