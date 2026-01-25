import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Query,
  BadRequestException,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { CloudinaryService } from './cloudinary.service'

@Controller('uploads')
export class UploadController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Query('folder') folder?: string) {
    if (!file) {
      throw new BadRequestException('No file uploaded')
    }
    const result = await this.cloudinaryService.uploadFile(file, folder)
    return {
      url: result.secure_url,
      public_id: result.public_id,
    }
  }
}
