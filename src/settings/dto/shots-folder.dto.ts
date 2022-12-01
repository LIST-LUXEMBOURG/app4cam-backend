import { IsNotEmpty, IsString } from 'class-validator'

export class ShotsFolderDto {
  @IsNotEmpty()
  @IsString()
  shotsFolder: string
}
