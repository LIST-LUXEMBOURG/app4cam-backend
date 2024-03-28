// © 2022-2024 Luxembourg Institute of Science and Technology
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { FilesModule } from '../files/files.module'
import { SnapshotsController } from './snapshots.controller'
import { SnapshotsService } from './snapshots.service'

@Module({
  controllers: [SnapshotsController],
  providers: [ConfigService, SnapshotsService],
  imports: [ConfigModule, FilesModule],
})
export class SnapshotsModule {}
