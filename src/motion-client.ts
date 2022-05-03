import axios from 'axios'

const BASE_URL = 'http://127.0.0.1:8080/'
const ACTION_URL = BASE_URL + '0/action/'
const CONFIG_URL = BASE_URL + '0/config/set?'
const WRITE_URL = BASE_URL + 'action/config/write'

const POST_PICTURE_FILENAME = '_%q'
const POST_SNAPSHOT_FILENAME = '_snapshot'

export class MotionClient {
  static async setFilename(filename: string): Promise<void> {
    const moveFilename = filename
    const pictureFilename = filename + POST_PICTURE_FILENAME
    const snapshotFilename = filename + POST_SNAPSHOT_FILENAME
    await axios.get(CONFIG_URL + 'movie_filename=' + moveFilename)
    await axios.get(CONFIG_URL + 'picture_filename=' + pictureFilename)
    await axios.get(CONFIG_URL + 'snapshot_filename=' + snapshotFilename)
    await axios.get(WRITE_URL)
  }

  static async setLeftTextOnImage(text: string) {
    await axios.get(CONFIG_URL + 'text_left=' + text)
    await axios.get(WRITE_URL)
  }

  static async takeSnapshot(): Promise<void> {
    await axios.get(ACTION_URL + 'snapshot')
  }
}
