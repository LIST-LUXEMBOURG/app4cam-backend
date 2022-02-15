import { ArrayNotEmpty, IsArray } from 'class-validator'

export class FilesDto {
  @IsArray()
  @ArrayNotEmpty()
  filenames: string[]
}
