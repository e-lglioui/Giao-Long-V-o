import { Module, NestModule, MiddlewareConsumer, OnModuleInit } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import databaseConfig from './config/database.config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './users/users.module';
import { ErrorHandlerMiddleware } from './common/middlewares/error-handler.middleware';
import { MongooseModule } from '@nestjs/mongoose';
import { EventsModule } from './events/events.module';
import {SchoolsModule } from './schools/schools.module';
import { StudentsModule } from './students/students.module';
import { existsSync, readdirSync } from 'fs';
import { UploadModule } from './upload/upload.module';
import { UploadController } from './upload/upload.controller';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
      cache: true,
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => {
        const templateDir = join(process.cwd(), 'dist', 'mail', 'templates');
        console.log('Template Directory:', templateDir);
        console.log('Template directory exists:', existsSync(templateDir));
        
        if (existsSync(templateDir)) {
          console.log('Contents of template directory:', readdirSync(templateDir));
        }

        return {
          transport: {
            host: config.get('SMTP_HOST'),
            port: parseInt(config.get('MAIL_PORT')),
            secure: config.get('MAIL_SECURE') === 'true',
            auth: {
              user: config.get('SMTP_USER'),
              pass: config.get('SMTP_PASSWORD'),
            },
          },
          defaults: {
            from: '"No Reply" <noreply@example.com>',
          },
          template: {
            dir: templateDir,
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
        };
      },
      inject: [ConfigService],
    }),
    UploadModule, // Ajoutez cette ligne,
    DatabaseModule,
    AuthModule,
    UserModule,
    EventsModule,
    SchoolsModule ,
    StudentsModule,
    MongooseModule.forRoot('mongodb+srv://elglioui:2072003Elglioui@gio-long.5q7hs.mongodb.net/?retryWrites=true&w=majority&appName=gio-long'),
  ],
  controllers: [UploadController], 
})
export class AppModule implements NestModule, OnModuleInit {
  async onModuleInit() {
    // Log template directory contents on startup
    const templateDir = join(process.cwd(), 'dist', 'mail', 'templates');
    console.log('Checking template directory on startup:');
    console.log('Template Directory:', templateDir);
    console.log('Template directory exists:', existsSync(templateDir));
    
    if (existsSync(templateDir)) {
      console.log('Contents of template directory:', readdirSync(templateDir));
    }
  }

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ErrorHandlerMiddleware).forRoutes('*');
  }
}