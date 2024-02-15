// © 2022-2024 Luxembourg Institute of Science and Technology
import { readFile } from 'fs/promises'
import { VersionDto } from '../dto/version.dto'

const COMMIT_HASH_FILE = 'version.txt'

export class VersionInteractor {
  static async getVersion(): Promise<VersionDto> {
    const buffer = await readFile(COMMIT_HASH_FILE)
    const content = buffer.toString()
    const contentParts = content.split(':')
    const version = contentParts[0]
    const commitHash = contentParts[1]
    return {
      commitHash,
      version,
    }
  }
}
