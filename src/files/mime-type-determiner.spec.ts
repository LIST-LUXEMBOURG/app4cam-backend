import { MimeTypeDeterminer } from './mime-type-determiner'

describe('MimeTypeDeterminer', () => {
  describe('getContentType', () => {
    it('returns content type for .txt', () => {
      expect(MimeTypeDeterminer.getContentType('.txt')).toEqual('text/plain')
    })

    it('returns content type for txt', () => {
      expect(MimeTypeDeterminer.getContentType('txt')).toEqual('text/plain')
    })

    it('returns content type for jpeg', () => {
      expect(MimeTypeDeterminer.getContentType('jpeg')).toEqual('image/jpeg')
    })

    it('returns content type for jpg', () => {
      expect(MimeTypeDeterminer.getContentType('jpg')).toEqual('image/jpeg')
    })

    it('returns content type for mp4', () => {
      expect(MimeTypeDeterminer.getContentType('mp4')).toEqual('video/mp4')
    })

    it('returns content type for mkv', () => {
      expect(MimeTypeDeterminer.getContentType('mkv')).toEqual(
        'video/x-matroska',
      )
    })
  })
})
