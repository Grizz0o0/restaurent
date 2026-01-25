import { Controller, Post, UseInterceptors, UploadedFile, Get, Param, Res } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { extname, join } from 'path'
import { Response } from 'express'

import * as multer from 'multer'
const diskStorage = multer.diskStorage

@Controller('uploads')
export class UploadController {
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req: any, file: any, cb: any) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('')
          cb(null, `${randomName}${extname(file.originalname)}`)
        },
      }),
    }),
  )
  uploadFile(@UploadedFile() file: any) {
    return {
      url: `${process.env.API_URL || 'http://localhost:3001'}/uploads/${file.filename}`,
    }
  }

  @Get(':filename')
  serveFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = join(process.cwd(), 'uploads', filename)
    return res.sendFile(filePath)
  }
}
