import { Test, TestingModule } from '@nestjs/testing'
import { FilesService } from './files.service'
import { readdir, rm, writeFile } from 'fs/promises'
import { ConfigService } from '@nestjs/config'

const TEST_FOLDER = 'src/files/test'

describe('FilesService', () => {
  let service: FilesService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConfigService, FilesService],
    }).compile()

    service = module.get<FilesService>(FilesService)
  })

  afterEach(async () => {
    await readdir(TEST_FOLDER).then((files) =>
      Promise.all(
        files.map((file) => rm(TEST_FOLDER + '/' + file, { recursive: true })),
      ),
    )
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should return no files', async () => {
    service.setFileFolderPath(TEST_FOLDER)
    const files = await service.findAll()
    expect(files).toEqual([])
  })

  it('should return one file', async () => {
    await writeFile(TEST_FOLDER + '/a.txt', 'b')
    service.setFileFolderPath(TEST_FOLDER)
    const files = await service.findAll()
    expect(files).toEqual(expect.any(Array))
    expect(files).toHaveLength(1)
    expect(files[0].name).toEqual('a.txt')
    expect(files[0].creationTime).toEqual(expect.any(Object))
  })

  it('should return three files', async () => {
    await writeFile(TEST_FOLDER + '/a.txt', 'aa')
    await writeFile(TEST_FOLDER + '/b.txt', 'bb')
    await writeFile(TEST_FOLDER + '/c.txt', 'cc')
    service.setFileFolderPath(TEST_FOLDER)
    const files = await service.findAll()
    expect(files).toEqual(expect.any(Array))
    expect(files).toHaveLength(3)
    expect(files[0].name).toEqual('a.txt')
    expect(files[0].creationTime).toEqual(expect.any(Object))
    expect(files[1].name).toEqual('b.txt')
    expect(files[1].creationTime).toEqual(expect.any(Object))
    expect(files[2].name).toEqual('c.txt')
    expect(files[2].creationTime).toEqual(expect.any(Object))
  })
})
