import { exec } from 'child_process'
import { Readable } from 'stream'

function convertReadableToString(stream: Readable): Promise<string> {
  const chunks = []
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
    stream.on('error', (err) => reject(err))
    stream.on('end', () =>
      resolve(Buffer.concat(chunks).toString('utf8').trim()),
    )
  })
}

export class SystemTimeInteractor {
  static async getSystemTimeInIso8601Format(): Promise<string> {
    const isWindows = process.platform === 'win32'
    if (isWindows) {
      // /bin/date command does not exist on Windows machines.
      return Promise.resolve('')
    }
    const { stdout } = await exec('/bin/date --iso-8601=seconds')
    const time = convertReadableToString(stdout)
    return time
  }

  static async setSystemTimeInIso8601Format(systemTime: string): Promise<void> {
    const isWindows = process.platform === 'win32'
    if (isWindows) {
      // /bin/date command does not exist on Windows machines.
      return Promise.resolve()
    }
    await exec(
      `sudo /bin/date --set="${systemTime}" | ${__dirname}/system_to_rtc.sh`,
    )
    return
  }
}
