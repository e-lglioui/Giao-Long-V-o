import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import databaseConfig from './config/database.config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './users/users.module'
import { ErrorHandlerMiddleware } from './common/middlewares/error-handler.middleware';
import { MongooseModule } from '@nestjs/mongoose';

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
        console.log('Mail Configuration:', {
          host: config.get('SMTP_HOST'),
          port: config.get('MAIL_PORT'),
          user: config.get('SMTP_USER')
        });
        
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
            dir: join(process.cwd(), 'dist/templates'),  // Chemin corrigé
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
        };
      },
      inject: [ConfigService],
    }),
    DatabaseModule,
    AuthModule,
    UserModule,
    MongooseModule.forRoot('mongodb+srv://elglioui:2072003Elglioui@gio-long.5q7hs.mongodb.net/?retryWrites=true&w=majority&appName=gio-long'),
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ErrorHandlerMiddleware).forRoutes('*');
  }
}