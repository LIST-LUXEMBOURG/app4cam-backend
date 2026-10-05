/**
 * Copyright (C) since 2022 Luxembourg Institute of Science and Technology
 *
 * App4Cam is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * App4Cam is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with App4Cam.  If not, see <https://www.gnu.org/licenses/>.
 */
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  Res,
  StreamableFile,
} from '@nestjs/common'
import type { Response } from 'express'
import { buildAttachmentContentDisposition } from '../shared/content-disposition.js'
import { FilesDto } from './dto/files.dto.js'
import { FileDeletionResponse } from './entities/file-deletion-response.entity.js'
import { File } from './entities/file.entity.js'
import { FilesService } from './files.service.js'

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post()
  async downloadFiles(
    @Body() filesDto: FilesDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (filesDto.filenames.some((filename) => filename.includes('../'))) {
      throw new ForbiddenException()
    }
    let archive
    try {
      archive = await this.filesService.getStreamableFiles(filesDto.filenames)
    } catch (error) {
      if (error instanceof Error && error.message.includes('File not found')) {
        throw new NotFoundException(error.message)
      } else {
        throw error
      }
    }
    res.set({
      'Content-Type': archive.contentType,
      'Content-Disposition': buildAttachmentContentDisposition(
        archive.filename,
      ),
    })
    return new StreamableFile(archive.stream)
  }

  @Get()
  async findAll(): Promise<File[]> {
    return this.filesService.findAll()
  }

  @Delete()
  async deleteFiles(@Body() filesDto: FilesDto): Promise<FileDeletionResponse> {
    return this.filesService.deleteFiles(filesDto.filenames)
  }

  @Get(':id')
  async downloadFile(
    @Param('id') filename: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (filename.includes('../')) {
      throw new ForbiddenException()
    }
    const file = await this.filesService.getStreamableFile(filename)
    res.set({
      'Content-Type': file.contentType,
      'Content-Disposition': buildAttachmentContentDisposition(filename),
    })
    return new StreamableFile(file.stream)
  }

  @Delete(':id')
  async deleteFile(@Param('id') filename: string): Promise<void> {
    if (filename.includes('../')) {
      throw new ForbiddenException()
    }
    try {
      await this.filesService.removeFile(filename)
    } catch (error) {
      if (
        error instanceof Error &&
        'code' in error &&
        error.code !== 'ENOENT'
      ) {
        throw error
      }
      throw new NotFoundException()
    }
  }
}
