import 'dotenv/config'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { LoggingInterceptor } from 'src/shared/interceptors/logging.interceptor'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const port = process.env.APP_PORT || 3052
  app.setGlobalPrefix('v1/api')
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? `http://localhost:${port}`,
    credentials: true,
  })
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    // new TransformInterceptor(),
  )
  await app.listen(port)
}
bootstrap()
