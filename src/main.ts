import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { Logger, ValidationPipe } from "@nestjs/common"
import * as dotenv from "dotenv"
import * as express from "express"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"

async function bootstrap() {
  dotenv.config()
  const app = await NestFactory.create(AppModule)

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
  app.enableCors({
    origin: "http://localhost:5173",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })

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

