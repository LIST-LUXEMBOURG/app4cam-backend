import { StreamWithContentType } from '../shared/entities/stream-with-content-type'

export interface ISnapshotsService {
  takeSnapshot: () => Promise<StreamWithContentType>
}
