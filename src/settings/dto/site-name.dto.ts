// © 2022-2024 Luxembourg Institute of Science and Technology
import { Matches } from 'class-validator'

export class SiteNameDto {
  @Matches(/^[a-zA-Z0-9-]*$/)
  siteName: string
}
