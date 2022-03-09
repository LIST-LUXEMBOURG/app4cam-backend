import axios from 'axios'

const BASE_URL = 'http://10.131.10.28:8080/0/'
const ACTION_URL = BASE_URL + 'action/'
const CONFIG_URL = BASE_URL + 'config/'
const DATE_TIME_FILENAME_PART = '%Y%m%dT%H%M%SZ'
const POST_PICTURE_FILENAME = '_%q'
const POST_SNAPSHOT_FILENAME = '_snapshot'

export class MotionClient {
  static async setFilename(siteName: string, deviceId: string): Promise<void> {
    const filename = siteName + '_' + deviceId + '_' + DATE_TIME_FILENAME_PART
    const moveFilename = filename
    const pictureFilename = filename + POST_PICTURE_FILENAME
    const snapshotFilename = filename + POST_SNAPSHOT_FILENAME
    await axios.get(CONFIG_URL + 'set?movie_filename=' + moveFilename)
    await axios.get(CONFIG_URL + 'set?picture_filename=' + pictureFilename)
    await axios.get(CONFIG_URL + 'set?snapshot_filename=' + snapshotFilename)
  }

  static async takeSnapshot(): Promise<void> {
    await axios.get(ACTION_URL + 'snapshot')
  }
}
