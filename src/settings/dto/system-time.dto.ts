import { IsDateString, IsNotEmpty } from 'class-validator'

export class SystemTimeDto {
  @IsNotEmpty()
  @IsDateString()
  systemTime: string
}
