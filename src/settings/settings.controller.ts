import { Controller, Get, Body, Patch } from '@nestjs/common'
import { SetSiteNameDto } from './dto/set-site-name.dto'
import { SettingsService } from './settings.service'

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('siteName')
  getSiteName() {
    return this.settingsService.getSiteName()
  }

  @Patch('siteName')
  setSiteName(@Body() body: SetSiteNameDto) {
    return this.settingsService.setSiteName(body.siteName)
  }
}
