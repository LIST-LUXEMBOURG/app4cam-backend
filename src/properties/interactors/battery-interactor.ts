// © 2024 Luxembourg Institute of Science and Technology
import { exec as execSync } from 'child_process'
import { promisify } from 'util'

const exec = promisify(execSync)

export class BatteryInteractor {
  static async getBatteryVoltage(): Promise<number> {
    const isWindows = process.platform === 'win32'
    if (isWindows) {
      // This command does not exist on Windows machines.
      return -1
    }
    const currentWorkingDirectory = process.cwd()
    const { stdout, stderr } = await exec(
      `sudo ${currentWorkingDirectory}/scripts/variscite/battery-monitoring/battery_monitoring`,
    )
    if (stderr) {
      throw new Error(stderr)
    }
    const value = parseFloat(stdout)
    return value
  }
}
