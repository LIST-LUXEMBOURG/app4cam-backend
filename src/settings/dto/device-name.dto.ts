import { IsNotEmpty, Matches } from 'class-validator'

export class DeviceNameDto {
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9-]+$/)
  deviceName: string
}
