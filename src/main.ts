import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { Logger, ValidationPipe } from "@nestjs/common"
import * as dotenv from "dotenv"
import * as express from "express"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"
import { join } from 'path'
import { NestExpressApplication } from '@nestjs/platform-express'
import { existsSync, mkdirSync } from 'fs'

async function bootstrap() {
  dotenv.config()
  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  // Add explicit body parsing middleware
  app.use(express.json({ limit: "10mb" }))
  app.use(express.urlencoded({ extended: true, limit: "10mb" }))

  // Add global validation pipe with less strict settings
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      // Remove these strict validation options
      forbidNonWhitelisted: false,
      forbidUnknownValues: false,
    }),
  )

  // Configuration de CORS
  // app.enableCors({
  //   origin: ["http://localhost:5173", "http://localhost:8081"],
  //   methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  //   credentials: true,
  // })
  app.enableCors({ origin: "*", credentials: true })

  // Créer les dossiers d'upload s'ils n'existent pas
  const uploadPaths = [
    join(process.cwd(), 'uploads'),
    join(process.cwd(), 'uploads', 'images'),
    join(process.cwd(), 'uploads', 'documents')
  ];
  
  uploadPaths.forEach(path => {
    if (!existsSync(path)) {
      mkdirSync(path, { recursive: true });
    }
  });

  // Configuration pour servir des fichiers statiques
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/', // Cela signifie que les fichiers seront accessibles via /images/ au lieu de /uploads/images/
  });

  // Set up Swagger
  const config = new DocumentBuilder()
    .setTitle("Your API")
    .setDescription("API description")
    .setVersion("1.0")
    .addBearerAuth()
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup("api", app, document)

  const logger = new Logger("Bootstrap")
  await app.listen(process.env.PORT ?? 3000)
  logger.log(`Application is running on: ${await app.getUrl()}`)
}
bootstrap()

