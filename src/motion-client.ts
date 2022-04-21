import axios from 'axios'

const BASE_URL = 'http://127.0.0.1:8080/'
const ACTION_URL = BASE_URL + '0/action/'
const CONFIG_URL = BASE_URL + '0/config/'
const WRITE_URL = BASE_URL + 'action/config/write'

const DATE_TIME_FILENAME_PART = '%Y%m%dT%H%M%S'
const POST_PICTURE_FILENAME = '_%q'
const POST_SNAPSHOT_FILENAME = '_snapshot'

export class MotionClient {
  static async setFilename(
    siteName: string,
    deviceId: string,
    timeZone: string,
  ): Promise<void> {
    const filename =
      siteName +
      '_' +
      deviceId +
      '_' +
      DATE_TIME_FILENAME_PART +
      '_' +
      timeZone.replaceAll('/', '-')
    const moveFilename = filename
    const pictureFilename = filename + POST_PICTURE_FILENAME
    const snapshotFilename = filename + POST_SNAPSHOT_FILENAME
    await axios.get(CONFIG_URL + 'set?movie_filename=' + moveFilename)
    await axios.get(CONFIG_URL + 'set?picture_filename=' + pictureFilename)
    await axios.get(CONFIG_URL + 'set?snapshot_filename=' + snapshotFilename)
    await axios.get(WRITE_URL)
  }

  static async takeSnapshot(): Promise<void> {
    await axios.get(ACTION_URL + 'snapshot')
  }
}
