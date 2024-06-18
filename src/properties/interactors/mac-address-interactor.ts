// © 2022-2024 Luxembourg Institute of Science and Technology
import { exec as execSync } from 'child_process'
import { promisify } from 'util'
import { CommandExecutionException } from '../../shared/exceptions/CommandExecutionException'
import { CommandUnavailableOnWindowsException } from '../../shared/exceptions/CommandUnavailableOnWindowsException'

const exec = promisify(execSync)

export class MacAddressInteractor {
  static async getFirstMacAddress(): Promise<string> {
    CommandUnavailableOnWindowsException.throwIfOnWindows()
    const { stdout, stderr } = await exec('cat /sys/class/net/*/address')
    if (stderr) {
      throw new CommandExecutionException(stderr)
    }
    const firstAddressMatch = stdout.match(
      /((?:[a-zA-Z0-9]{2}[:-]){5}[a-zA-Z0-9]{2})/m,
    )
    const firstAddress = firstAddressMatch[0]
    return firstAddress
  }
}
