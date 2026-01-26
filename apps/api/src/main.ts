import 'dotenv/config'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { LoggingInterceptor } from '@/shared/interceptors/logging.interceptor'
import { ValidationPipe } from '@nestjs/common'
import { PrismaClientExceptionFilter } from '@/shared/filters/prisma-client-exception.filter'
import { HttpAdapterHost } from '@nestjs/core'
import { TransformInterceptor } from '@/shared/interceptors/transform.interceptor'
import { AllExceptionsFilter } from '@/shared/filters/all-exception.filter'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.enableShutdownHooks()
  const port = process.env.APP_PORT || 3052
  app.setGlobalPrefix('v1/api')
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? `http://localhost:${port}`,
    credentials: true,
  })
  app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor())
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }))

  const httpAdapterHost = app.get(HttpAdapterHost)
  app.useGlobalFilters(
    new AllExceptionsFilter(httpAdapterHost),
    new PrismaClientExceptionFilter(httpAdapterHost.httpAdapter),
  )
  await app.listen(port)
}
bootstrap()
