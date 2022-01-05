import { readFile, writeFile } from 'fs/promises'
import { Settings } from './settings'

const JSON_INDENTATION_SPACES = 2

export class SettingsFileProvider {
  static async readSettingsFile(filePath: string): Promise<Settings> {
    const buffer = await readFile(filePath)
    const data = buffer.toString()
    const settings = JSON.parse(data)
    return settings
  }

  static async writeSettingsToFile(settings: Settings, filePath: string) {
    const data = JSON.stringify(settings, null, JSON_INDENTATION_SPACES)
    await writeFile(filePath, data)
  }
}
