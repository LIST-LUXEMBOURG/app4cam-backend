import { Readable } from 'stream'

export interface ILogFilesService {
  getAppLogFileStream: () => Promise<Readable>
  getMotionLogFileStream: () => Promise<Readable>
  removeOldLogs: () => Promise<void>
}
