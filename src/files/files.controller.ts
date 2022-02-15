import {
  Body,
  Controller,
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

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get()
  async findAll(): Promise<File[]> {
    return this.filesService.findAll()
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

  @Post('download')
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

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.filesService.remove(+id)
  // }
}
