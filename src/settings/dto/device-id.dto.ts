import { IsNotEmpty } from 'class-validator'

export class DeviceIdDto {
  @IsNotEmpty()
  deviceId: string
}
