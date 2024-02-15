// © 2022-2024 Luxembourg Institute of Science and Technology
import { IsNotEmpty, IsTimeZone } from 'class-validator'

export class TimeZoneDto {
  @IsNotEmpty()
  @IsTimeZone()
  timeZone: string
}
