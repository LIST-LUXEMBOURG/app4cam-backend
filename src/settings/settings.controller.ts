import { Controller, Get, Body, Patch } from '@nestjs/common'
import { SetSiteNameDto } from './dto/set-site-name.dto'
import { SettingsService } from './settings.service'

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('siteName')
  async getSiteName(): Promise<SetSiteNameDto> {
    const siteName = await this.settingsService.getSiteName()
    return {
      siteName,
    }
  }

  @Patch('siteName')
  setSiteName(@Body() body: SetSiteNameDto) {
    return this.settingsService.setSiteName(body.siteName)
  }
}
