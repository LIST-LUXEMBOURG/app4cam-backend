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
import { FilesService } from './files.service'
import { File } from './entities/file.entity'
import { FilesDto } from './dto/files.dto'
import { FileDeletionResponse } from './entities/file-deletion-response.entity'

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
  downloadFile(@Param('id') filename: string, @Res({ passthrough: true }) res) {
    const file = this.filesService.getStreamableFile(filename)
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
