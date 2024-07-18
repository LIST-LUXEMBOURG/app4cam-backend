/**
 * Copyright (C) 2022-2024  Luxembourg Institute of Science and Technology
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
import { FilesDto } from './dto/files.dto'
import { FileDeletionResponse } from './entities/file-deletion-response.entity'
import { File } from './entities/file.entity'
import { FilesService } from './files.service'

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post()
  async downloadFiles(
    @Body() filesDto: FilesDto,
    @Res({ passthrough: true }) res,
  ) {
    if (filesDto.filenames.some((filename) => filename.includes('../'))) {
      throw new ForbiddenException()
    }
    let archive
    try {
      archive = await this.filesService.getStreamableFiles(filesDto.filenames)
    } catch (error) {
      if (error.message.includes('File not found')) {
        throw new NotFoundException(error.message)
      } else {
        throw error
      }
    }
    res.set({
      'Content-Type': archive.contentType,
      'Content-Disposition': 'attachment; filename="' + archive.filename + '"',
    })
    return new StreamableFile(archive.stream)
  }

  @Get()
  async findAll(): Promise<File[]> {
    return this.filesService.findAll()
  }

  @Delete()
  async deleteFiles(@Body() filesDto: FilesDto): Promise<FileDeletionResponse> {
    if (filesDto.filenames.some((filename) => filename.includes('../'))) {
      throw new ForbiddenException()
    }

    if (filesDto.filenames.length === 1 && filesDto.filenames[0] === '*') {
      await this.filesService.removeAllFiles()
      return {
        '*': true,
      }
    }

    const filesWithDeletedState = await this.filesService.removeFiles(
      filesDto.filenames,
    )
    let isNoFileAtAllDeleted = true
    for (const item in filesWithDeletedState) {
      if (filesWithDeletedState[item]) {
        isNoFileAtAllDeleted = false
        break
      }
    }
    if (isNoFileAtAllDeleted) {
      throw new NotFoundException()
    }
    return filesWithDeletedState
  }

  @Get(':id')
  async downloadFile(
    @Param('id') filename: string,
    @Res({ passthrough: true }) res,
  ) {
    const file = await this.filesService.getStreamableFile(filename)
    res.set({
      'Content-Type': file.contentType,
      'Content-Disposition': 'attachment; filename="' + filename + '"',
    })
    return new StreamableFile(file.stream)
  }

  @Delete(':id')
  async deleteFile(@Param('id') filename: string): Promise<void> {
    try {
      await this.filesService.removeFile(filename)
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error
      }
      throw new NotFoundException()
    }
  }
}
