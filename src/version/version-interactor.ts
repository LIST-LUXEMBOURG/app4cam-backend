import { exec as execSync } from 'child_process'
import { promisify } from 'util'
import { VersionDto } from './version.dto'

const exec = promisify(execSync)

export class VersionInteractor {
  static async getVersion(): Promise<VersionDto> {
    const { stdout, stderr } = await exec('git rev-parse --short HEAD')
    if (stderr) {
      throw new Error(stderr)
    }
    const commitHash = stdout.trimEnd()
    const version = process.env.npm_package_version
    return {
      commitHash,
      version,
    }
  }
}
