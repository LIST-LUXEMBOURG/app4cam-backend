import { StreamWithContentType } from '../shared/entities/stream-with-content-type.js'

export interface ISnapshotsService {
  takeSnapshot: () => Promise<StreamWithContentType>
}
