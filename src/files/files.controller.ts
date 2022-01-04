import { Controller, Get } from '@nestjs/common'
import { FilesService } from './files.service'
import { File } from './entities/file.entity'

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get()
  async findAll(): Promise<File[]> {
    this.filesService.setFileFolderPath('src/files/test')
    return this.filesService.findAll()
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.filesService.remove(+id)
  // }
}
