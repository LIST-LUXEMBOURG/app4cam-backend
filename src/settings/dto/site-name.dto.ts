import { IsNotEmpty, Matches } from 'class-validator'

export class SiteNameDto {
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9_-]+$/)
  siteName: string
}
