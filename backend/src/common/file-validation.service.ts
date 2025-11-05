import { BadRequestException } from '@nestjs/common';
// file-type v16 uses commonjs, not ESM
const FileType = require('file-type');

export class FileValidationService {
  private static readonly ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
  ];

  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  /**
   * Validates file by checking magic bytes (file signature)
   * This prevents users from simply renaming files to bypass extension checks
   */
  static async validateImageFile(file: Express.Multer.File): Promise<void> {
    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${this.MAX_FILE_SIZE / 1024 / 1024}MB`,
      );
    }

    // Check file exists
    if (!file.buffer && !file.path) {
      throw new BadRequestException('File data is missing');
    }

    // Read file buffer for magic byte validation
    const fileBuffer = file.buffer;
    if (!fileBuffer) {
      throw new BadRequestException('Unable to read file contents');
    }

    // Validate file type using magic bytes
    let fileType;
    try {
      fileType = await FileType.fromBuffer(fileBuffer);
    } catch (error) {
      throw new BadRequestException('Unable to determine file type');
    }

    if (!fileType) {
      throw new BadRequestException(
        'Unable to determine file type - file may be corrupted or invalid',
      );
    }

    // Check if MIME type is allowed
    if (!this.ALLOWED_MIME_TYPES.includes(fileType.mime)) {
      throw new BadRequestException(
        `File type ${fileType.mime} is not allowed. Allowed types: ${this.ALLOWED_MIME_TYPES.join(', ')}`,
      );
    }

    console.log(`✓ File validated: ${fileType.mime} (${file.size} bytes)`);
  }

  /**
   * Sanitizes filename to prevent path traversal attacks
   */
  static sanitizeFilename(filename: string): string {
    // Remove any path separators and parent directory references
    return filename
      .replace(/\.\./g, '') // Remove ..
      .replace(/[\/\\]/g, '') // Remove path separators
      .replace(/[^a-zA-Z0-9._-]/g, '_'); // Replace special chars with underscore
  }
}
