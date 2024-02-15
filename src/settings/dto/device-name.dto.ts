// © 2022-2024 Luxembourg Institute of Science and Technology
import { IsNotEmpty, Matches } from 'class-validator'

export class DeviceNameDto {
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9-]+$/)
  deviceName: string
}
