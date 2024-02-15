// © 2022-2024 Luxembourg Institute of Science and Technology
import { IsDateString, IsNotEmpty } from 'class-validator'

export class SystemTimeDto {
  @IsNotEmpty()
  @IsDateString()
  systemTime: string
}
