import { ConfigService } from '@nestjs/config'
import { v2 as cloudinary } from 'cloudinary'
import { Env } from '@/env.validation'

export const CloudinaryProvider = {
  provide: 'CLOUDINARY',
  inject: [ConfigService],
  useFactory: (configService: ConfigService<Env, true>) => {
    return cloudinary.config({
      cloud_name: configService.get('CLOUD_NAME'),
      api_key: configService.get('CLOUD_API_KEY'),
      api_secret: configService.get('CLOUD_API_SECRET'),
    })
  },
}
