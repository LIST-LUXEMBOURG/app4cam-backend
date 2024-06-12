// © 2024 Luxembourg Institute of Science and Technology
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { SettingsModule } from '../settings/settings.module'
import { StorageModule } from '../storage/storage.module'
import { MotionInteractorService } from './motion-interactor.service'

@Module({
  providers: [MotionInteractorService],
  imports: [ConfigModule, SettingsModule, StorageModule],
})
export class MotionInteractorModule {}
