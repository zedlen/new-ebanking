import { HttpException, Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class FilesService {
  AWS_S3_BUCKET = 'cdn.ebanking';
  s3 = new S3Client();
  private logger = new Logger(FilesService.name);

  async uploadFile(file) {
    const { originalname } = file;

    return await this.s3_upload(
      file.buffer,
      this.AWS_S3_BUCKET,
      originalname,
      file.mimetype,
    );
  }

  async s3_upload(
    file: Buffer,
    bucket: string,
    name: string,
    mimetype: string,
  ) {
    try {
      return await this.s3.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: String(name),
          Body: file,
          ACL: 'public-read',
          ContentType: mimetype,
          ContentDisposition: 'inline',
        }),
      );
    } catch (e) {
      this.logger.log(e);
      throw new HttpException(e?.message, 500);
    }
  }
}
