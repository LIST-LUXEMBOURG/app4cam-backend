// © 2024 Luxembourg Institute of Science and Technology
import { exec as execSync } from 'child_process'
import { promisify } from 'util'
import { CommandExecutionException } from '../../shared/exceptions/CommandExecutionException'
import { CommandUnavailableOnWindowsException } from '../../shared/exceptions/CommandUnavailableOnWindowsException'
import { FocusValueOutOfRange } from '../exceptions/FocusValueOutOfRange'

const exec = promisify(execSync)

interface FocusDetails {
  default?: number
  min?: number
  max?: number
  value?: number
}

export class VideoDeviceInteractor {
  static async getFocus(devicePath: string): Promise<FocusDetails> {
    CommandUnavailableOnWindowsException.throwIfOnWindows()
    const command = `sudo v4l2-ctl -d ${devicePath} -l | grep focus_absolute`
    const { stdout, stderr } = await exec(command)
    if (stderr) {
      throw new CommandExecutionException(stderr)
    }
    const line = stdout.trim()
    const controlMapping = line.split(': ')
    const focusMappings = controlMapping[1].split(' ')
    const focusMappingsAsObject: FocusDetails = {}
    for (const focusMapping of focusMappings) {
      const mapping = focusMapping.split('=')
      const key = mapping[0]
      const value = mapping[1]
      focusMappingsAsObject[key] = parseInt(value)
    }
    return focusMappingsAsObject
  }

  static async setFocus(devicePath: string, focus: number): Promise<void> {
    CommandUnavailableOnWindowsException.throwIfOnWindows()
    const currentFocus = await this.getFocus(devicePath)
    if (focus < currentFocus.min || currentFocus.max < focus) {
      throw new FocusValueOutOfRange(
        `Focus value ${focus} not between ${currentFocus.min} and ${currentFocus.max}!`,
      )
    }
    const currentWorkingDirectory = process.cwd()
    const command = `sudo ${currentWorkingDirectory}/scripts/raspberry-pi/set-camera-focus.sh ${devicePath} ${focus}`
    const { stderr } = await exec(command)
    if (stderr) {
      throw new CommandExecutionException(stderr)
    }
  }
}
