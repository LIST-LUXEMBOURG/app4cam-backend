// © 2024 Luxembourg Institute of Science and Technology
import { exec as execSync } from 'child_process'
import { promisify } from 'util'
import { CommandUnavailableOnWindowsException } from '../exceptions/CommandUnavailableOnWindowsException'

const exec = promisify(execSync)

const DEVICE_PATH = '/dev/v4l-subdev1'

interface Focus {
  default?: number
  min?: number
  max?: number
  value?: number
}

export class VideoDeviceInteractor {
  static async getFocus(): Promise<Focus> {
    if (process.platform === 'win32') {
      throw new CommandUnavailableOnWindowsException()
    }
    const command = `sudo v4l2-ctl -d ${DEVICE_PATH} -l | grep focus_absolute`
    const { stdout, stderr } = await exec(command)
    if (stderr) {
      throw new Error(stderr)
    }
    const line = stdout.trim()
    const controlMapping = line.split(': ')
    const focusMappings = controlMapping[1].split(' ')
    const focusMappingsAsObject: Focus = {}
    for (const focusMapping of focusMappings) {
      const mapping = focusMapping.split('=')
      const key = mapping[0]
      const value = mapping[1]
      focusMappingsAsObject[key] = parseInt(value)
    }
    return focusMappingsAsObject
  }

  static async setFocus(focus: number): Promise<void> {
    if (process.platform === 'win32') {
      throw new CommandUnavailableOnWindowsException()
    }
    const currentFocus = await this.getFocus()
    if (focus < currentFocus.min || currentFocus.max < focus) {
      throw new Error('Focus value not supported!')
    }
    const command = `sudo scripts/raspberry-pi/set-camera-focus.sh ${DEVICE_PATH} ${focus}`
    const { stderr } = await exec(command)
    if (stderr) {
      throw new Error(stderr)
    }
  }
}
