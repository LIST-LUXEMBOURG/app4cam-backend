/**
 * Copyright (C) 2022-2024  Luxembourg Institute of Science and Technology
 *
 * App4Cam is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * App4Cam is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with App4Cam.  If not, see <https://www.gnu.org/licenses/>.
 */
import { mkdir, rm } from 'fs/promises'
import { SettingsFromJsonFile } from './entities/settings'
import {
  JSON_SETTINGS_WITH_NONE_SET,
  SettingsFileProvider,
} from './settings-file-provider'

const FIXTURE_FOLDER_PATH = 'src/settings/fixtures'
const TEST_FOLDER_PATH = 'src/settings/test'

describe(SettingsFileProvider.name, () => {
  describe(SettingsFileProvider.readSettingsFile.name, () => {
    describe('when an empty JSON file is present', () => {
      it('returns an object with empty settings', async () => {
        const settings = await SettingsFileProvider.readSettingsFile(
          FIXTURE_FOLDER_PATH + '/empty-settings.json',
        )
        expect(settings).toEqual(JSON_SETTINGS_WITH_NONE_SET)
      })
    })

    describe('when a JSON file with an empty object is present', () => {
      it('returns an object with empty settings', async () => {
        const settings = await SettingsFileProvider.readSettingsFile(
          FIXTURE_FOLDER_PATH + '/empty-object-settings.json',
        )
        expect(settings).toEqual(JSON_SETTINGS_WITH_NONE_SET)
      })
    })

    describe('when a JSON file with one setting is present', () => {
      it('returns an object with the setting set and all the others being empty', async () => {
        const settings = await SettingsFileProvider.readSettingsFile(
          FIXTURE_FOLDER_PATH + '/one-setting-settings.json',
        )
        expect(settings).toEqual({
          ...JSON_SETTINGS_WITH_NONE_SET,
          ...{
            general: {
              deviceName: 'a',
            },
          },
        })
      })
    })

    describe('when the file does not exist', () => {
      it('returns an object with empty properties and default camera and triggering light', async () => {
        const settings = await SettingsFileProvider.readSettingsFile(
          FIXTURE_FOLDER_PATH + '/a',
        )
        const expected: SettingsFromJsonFile = {
          camera: {
            light: 'visible',
          },
          general: {},
          triggering: {
            light: 'visible',
          },
        }
        expect(settings).toEqual(expected)
      })
    })
  })

  describe(SettingsFileProvider.writeSettingsToFile.name, () => {
    const TEMPORARY_FILE_NAME = 'write-settings.json'
    const TEMPORARY_FILE_PATH = TEST_FOLDER_PATH + '/' + TEMPORARY_FILE_NAME

    beforeAll(() => {
      mkdir(TEST_FOLDER_PATH)
    })

    it('writes settings object', async () => {
      const SETTINGS = {
        camera: {
          light: 'visible' as const,
        },
        general: {
          deviceName: 'd',
          isAlternatingLightModeEnabled: false,
          siteName: 's',
        },
        triggering: {
          light: 'infrared' as const,
          sleepingTime: {
            hour: 1,
            minute: 2,
          },
          temperatureThreshold: 0,
          wakingUpTime: {
            hour: 3,
            minute: 4,
          },
        },
      }
      await SettingsFileProvider.writeSettingsToFile(
        SETTINGS,
        TEMPORARY_FILE_PATH,
      )
      const settingsRetrieved =
        await SettingsFileProvider.readSettingsFile(TEMPORARY_FILE_PATH)
      expect(settingsRetrieved).toEqual(SETTINGS)
    })

    afterAll(async () => {
      rm(TEST_FOLDER_PATH, { recursive: true, force: true })
    })
  })
})
