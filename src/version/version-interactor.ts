import { readFile } from 'fs/promises'
import { VersionDto } from './version.dto'

const COMMIT_HASH_FILE = 'commit-hash.txt'

export class VersionInteractor {
  static async getVersion(): Promise<VersionDto> {
    const buffer = await readFile(COMMIT_HASH_FILE)
    const commitHash = buffer.toString()
    const version = process.env.npm_package_version
    return {
      commitHash,
      version,
    }
  }
}
