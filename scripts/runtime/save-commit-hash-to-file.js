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
/* eslint-disable @typescript-eslint/no-var-requires */
const { exec } = require('child_process')
const fs = require('fs')

const COMMAND = 'git rev-parse --short HEAD'
const FILENAME = 'version.txt'

exec(COMMAND, (error, stdout, stderr) => {
  if (error) {
    console.log(`error: ${error.message}`)
    process.exit(1)
  }
  if (stderr) {
    console.log(`stderr: ${stderr}`)
    process.exit(1)
  }
  const hash = stdout.trim()
  console.log(`latest commit hash: ${hash}`)

  const version = process.env.npm_package_version
  console.log(`latest version: ${version}`)

  const data = `${version}:${hash}`

  fs.writeFile(FILENAME, data, (err) => {
    if (err) {
      console.log(err)
      process.exit(1)
    }
    console.log(`Wrote hash to file: ${FILENAME}`)
  })
})
