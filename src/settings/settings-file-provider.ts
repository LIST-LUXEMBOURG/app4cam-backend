import { readFile, writeFile } from 'fs/promises'
import { SettingsFromJsonFile } from './settings'

const JSON_INDENTATION_SPACES = 2

export class SettingsFileProvider {
  static async readSettingsFile(
    filePath: string,
  ): Promise<SettingsFromJsonFile> {
    try {
      const buffer = await readFile(filePath)
      const data = buffer.toString()
      const settings = JSON.parse(data)
      return settings
    } catch (err) {
      if (err.code !== 'ENOENT') {
        throw err
      }
      return {
        deviceName: '',
        siteName: '',
      }
    }
  }

  static async writeSettingsToFile(
    settings: SettingsFromJsonFile,
    filePath: string,
  ) {
    const data = JSON.stringify(settings, null, JSON_INDENTATION_SPACES)
    await writeFile(filePath, data)
  }
}
