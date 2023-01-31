import { exec as execSync } from 'child_process'
import { promisify } from 'util'
import { StorageUsageDto } from './dto/storage-usage.dto'
import { NumberUtils } from './number-utils'

const exec = promisify(execSync)

export class StorageUsageInteractor {
  static async getStorageUsage(path: string): Promise<StorageUsageDto> {
    const isWindows = process.platform === 'win32'
    if (isWindows) {
      // df command does not exist on Windows machines.
      return Promise.resolve({
        capacityKb: 0,
        usedPercentage: 0,
      })
    }
    const { stdout, stderr } = await exec(`df -Pkl | grep ${path}`)
    if (stderr) {
      throw new Error(stderr)
    }
    const parts = stdout.split(/\s+/)
    const usedKb = parseInt(parts[2])
    const availableKb = parseInt(parts[3])
    const capacityKb = usedKb + availableKb
    const usedPercentage = NumberUtils.roundNumberByDigits(
      (usedKb / capacityKb) * 100,
      2,
    )
    return {
      capacityKb,
      usedPercentage,
    }
  }
}