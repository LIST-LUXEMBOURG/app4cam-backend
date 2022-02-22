import axios from 'axios'

const BASE_URL = 'http://10.131.10.28:8080/0/config/'
const POST_FILENAME = '%Y%m%dT%H%M%SZ_%q'

export class MotionClient {
  static async setFilename(siteName: string, deviceId: string): Promise<void> {
    const filename = siteName + '_' + deviceId + '_' + POST_FILENAME
    await axios.get(BASE_URL + 'set?picture_filename=' + filename)
    await axios.get(BASE_URL + 'set?movie_filename=' + filename)
  }
}
