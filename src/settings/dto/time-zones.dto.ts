import { IsArray, IsNotEmpty, IsString } from 'class-validator'

export class TimeZonesDto {
  @IsArray()
  @IsNotEmpty({ each: true })
  @IsString({ each: true })
  timeZones: string[]
}
