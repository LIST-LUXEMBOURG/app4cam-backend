import { IsNotEmpty } from 'class-validator'

export class SetSiteNameDto {
  @IsNotEmpty()
  siteName: string
}
