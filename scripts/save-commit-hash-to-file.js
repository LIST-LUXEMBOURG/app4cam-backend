/* eslint-disable @typescript-eslint/no-var-requires */
const { exec } = require('child_process')
const fs = require('fs')

const COMMAND = 'git rev-parse --short HEAD'
const FILENAME = 'commit-hash.txt'

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
  console.log(`stdout: ${hash}`)

  fs.writeFile(FILENAME, hash, (err) => {
    if (err) {
      console.log(err)
      process.exit(1)
    }
    console.log(`Wrote hash to file: ${FILENAME}`)
  })
})
