// © 2022-2024 Luxembourg Institute of Science and Technology
import { IsNotEmpty, IsString } from 'class-validator'

export class ShotsFolderDto {
  @IsNotEmpty()
  @IsString()
  shotsFolder: string
}
