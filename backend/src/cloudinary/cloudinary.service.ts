import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

export interface CloudinaryUploadOptions {
  folder?: string;
  publicId?: string;
  resourceType?: 'image' | 'video' | 'raw' | 'auto';
  transformation?: Record<string, unknown>[];
}

export interface CloudinaryUploadResult {
  publicId: string;
  url: string;
  secureUrl: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  resourceType: string;
}

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  /**
   * Upload a file buffer to Cloudinary
   */
  async uploadBuffer(
    buffer: Buffer,
    options: CloudinaryUploadOptions = {},
  ): Promise<CloudinaryUploadResult> {
    const { folder = 'quikspit/uploads', publicId, resourceType = 'auto', transformation } = options;

    return new Promise((resolve, reject) => {
      const uploadOptions: Record<string, unknown> = {
        folder,
        resource_type: resourceType,
      };

      if (publicId) {
        uploadOptions.public_id = publicId;
      }

      if (transformation) {
        uploadOptions.transformation = transformation;
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error) {
            this.logger.error(`Cloudinary upload failed: ${error.message}`);
            reject(new BadRequestException(`Upload failed: ${error.message}`));
            return;
          }

          if (!result) {
            reject(new BadRequestException('Upload failed: No result returned'));
            return;
          }

          this.logger.log(`Uploaded to Cloudinary: ${result.public_id}`);
          resolve({
            publicId: result.public_id,
            url: result.url,
            secureUrl: result.secure_url,
            format: result.format,
            width: result.width,
            height: result.height,
            bytes: result.bytes,
            resourceType: result.resource_type,
          });
        },
      );

      uploadStream.end(buffer);
    });
  }

  /**
   * Upload a file from a local path to Cloudinary
   */
  async uploadFile(
    filePath: string,
    options: CloudinaryUploadOptions = {},
  ): Promise<CloudinaryUploadResult> {
    const { folder = 'quikspit/uploads', publicId, resourceType = 'auto', transformation } = options;

    try {
      const uploadOptions: Record<string, unknown> = {
        folder,
        resource_type: resourceType,
      };

      if (publicId) {
        uploadOptions.public_id = publicId;
      }

      if (transformation) {
        uploadOptions.transformation = transformation;
      }

      const result = await cloudinary.uploader.upload(filePath, uploadOptions);

      this.logger.log(`Uploaded to Cloudinary: ${result.public_id}`);
      return {
        publicId: result.public_id,
        url: result.url,
        secureUrl: result.secure_url,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        resourceType: result.resource_type,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Cloudinary upload failed: ${errorMessage}`);
      throw new BadRequestException(`Upload failed: ${errorMessage}`);
    }
  }

  /**
   * Delete a file from Cloudinary by public ID
   */
  async deleteFile(publicId: string, resourceType: 'image' | 'video' | 'raw' = 'image'): Promise<boolean> {
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
      });

      if (result.result === 'ok') {
        this.logger.log(`Deleted from Cloudinary: ${publicId}`);
        return true;
      }

      this.logger.warn(`Failed to delete from Cloudinary: ${publicId}`);
      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Cloudinary delete failed: ${errorMessage}`);
      throw new BadRequestException(`Delete failed: ${errorMessage}`);
    }
  }

  /**
   * Generate a Cloudinary URL with transformations
   */
  generateUrl(
    publicId: string,
    options: {
      width?: number;
      height?: number;
      crop?: string;
      quality?: string | number;
      format?: string;
    } = {},
  ): string {
    const { width, height, crop = 'fill', quality = 'auto', format = 'auto' } = options;

    const transformations: string[] = [];

    if (width) transformations.push(`w_${width}`);
    if (height) transformations.push(`h_${height}`);
    if (crop) transformations.push(`c_${crop}`);
    if (quality) transformations.push(`q_${quality}`);
    if (format) transformations.push(`f_${format}`);

    const transformationString = transformations.length > 0 ? transformations.join(',') + '/' : '';

    return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${transformationString}${publicId}`;
  }

  /**
   * Generate a video URL
   */
  generateVideoUrl(
    publicId: string,
    options: {
      width?: number;
      height?: number;
      quality?: string | number;
      format?: string;
    } = {},
  ): string {
    const { width, height, quality = 'auto', format = 'auto' } = options;

    const transformations: string[] = [];

    if (width) transformations.push(`w_${width}`);
    if (height) transformations.push(`h_${height}`);
    if (quality) transformations.push(`q_${quality}`);
    if (format) transformations.push(`f_${format}`);

    const transformationString = transformations.length > 0 ? transformations.join(',') + '/' : '';

    return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload/${transformationString}${publicId}`;
  }

  /**
   * Get cloud name for frontend usage
   */
  getCloudName(): string {
    return process.env.CLOUDINARY_CLOUD_NAME || '';
  }
}
