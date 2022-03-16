import { exec as execSync } from 'child_process'
import { promisify } from 'util'

const exec = promisify(execSync)

export interface DiskSpaceUsage {
  capacityKb: number
  usedPercentage: string
}

export class DiskSpaceUsageInteractor {
  static async getDiskSpaceUsage(): Promise<DiskSpaceUsage> {
    const isWindows = process.platform === 'win32'
    if (isWindows) {
      // df command does not exist on Windows machines.
      return Promise.resolve({
        capacityKb: 0,
        usedPercentage: '0.00',
      })
    }
    const { stdout, stderr } = await exec('df -Pkl | grep /dev/root')
    if (stderr) {
      throw new Error(stderr)
    }
    const parts = stdout.split(/\s+/)
    const usedKb = parseInt(parts[2])
    const availableKb = parseInt(parts[3])
    const capacityKb = usedKb + availableKb
    const usedPercentage = ((usedKb / capacityKb) * 100).toFixed(2)
    return {
      capacityKb,
      usedPercentage,
    }
  }
}
