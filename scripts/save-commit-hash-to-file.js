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
