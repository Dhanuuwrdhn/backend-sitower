import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { join } from 'path'
import * as fs from 'fs'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  ;['uploads/laporan', 'uploads/sertifikat', 'uploads/asbuilt'].forEach(
    (d) => !fs.existsSync(d) && fs.mkdirSync(d, { recursive: true }),
  )

  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' })

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://spektra.biz.id',
      process.env.FRONTEND_URL,
    ].filter(Boolean),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    credentials: true,
  })

  app.setGlobalPrefix('api')
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))

  const config = new DocumentBuilder()
    .setTitle('SITOWER API')
    .setDescription('PLN UIW Banten')
    .setVersion('1.0')
    .addBearerAuth()
    .build()
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config))

  await app.listen(process.env.PORT || 3001, '0.0.0.0')
  console.log('Backend: http://localhost:3001/api (Listening on 0.0.0.0)')
  console.log('Swagger: http://localhost:3001/docs')
}
bootstrap()
