// © 2024 Luxembourg Institute of Science and Technology
import { exec as execSync } from 'child_process'
import { promisify } from 'util'
import { CommandExecutionException } from '../../shared/exceptions/CommandExecutionException'
import { CommandUnavailableOnWindowsException } from '../../shared/exceptions/CommandUnavailableOnWindowsException'
import { UnsupportedDeviceTypeException } from '../exceptions/UnsupportedDeviceTypeException'

const exec = promisify(execSync)

export class BatteryInteractor {
  static async getBatteryVoltage(deviceType: string): Promise<number> {
    CommandUnavailableOnWindowsException.throwIfOnWindows()
    let relativeCommandPath = 'scripts/runtime/'
    if (deviceType === 'RaspberryPi') {
      relativeCommandPath += 'raspberry-pi/get-input-voltage.sh'
    } else if (deviceType === 'Variscite') {
      relativeCommandPath += 'variscite/battery-monitoring/battery_monitoring'
    } else {
      throw new UnsupportedDeviceTypeException(deviceType)
    }
    const currentWorkingDirectory = process.cwd()
    const { stdout, stderr } = await exec(
      `sudo ${currentWorkingDirectory}/${relativeCommandPath}`,
    )
    if (stderr) {
      throw new CommandExecutionException(stderr)
    }
    const value = parseFloat(stdout)
    return value
  }
}
