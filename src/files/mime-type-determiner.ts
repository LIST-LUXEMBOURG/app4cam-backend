// © 2022-2024 Luxembourg Institute of Science and Technology
export class MimeTypeDeterminer {
  static getContentType(fileExtension: string): string {
    if (fileExtension.startsWith('.')) {
      fileExtension = fileExtension.substring(1)
    }
    switch (fileExtension) {
      case 'jpeg':
      case 'jpg':
        return 'image/jpeg'
      case 'json':
        return 'application/json'
      case 'mkv':
        return 'video/x-matroska'
      case 'mp4':
        return 'video/mp4'
      case 'txt':
        return 'text/plain'
      case 'zip':
        return 'application/zip'
      default:
        throw new Error(
          `MIME type not found for file extension: '${fileExtension}'`,
        )
    }
  }
}
