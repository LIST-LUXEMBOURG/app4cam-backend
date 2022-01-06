import { IsNotEmpty } from 'class-validator'

export class SiteNameDto {
  @IsNotEmpty()
  siteName: string
}
