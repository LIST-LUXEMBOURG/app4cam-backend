// © 2022-2024 Luxembourg Institute of Science and Technology
import { ArrayNotEmpty, IsArray } from 'class-validator'

export class FilesDto {
  @IsArray()
  @ArrayNotEmpty()
  filenames: string[]
}
