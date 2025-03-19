// upload/upload.module.ts
import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { existsSync, mkdirSync } from 'fs';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: (req, file, callback) => {
          let uploadPath = './uploads';
          
          // Répertoire différent selon le type de fichier
          if (file.mimetype.includes('pdf')) {
            uploadPath = './uploads/documents';
          } else if (file.mimetype.includes('image')) {
            uploadPath = './uploads/images';
          }
          
          // Créer le répertoire s'il n'existe pas
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
          }
          
          callback(null, uploadPath);
        },
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        // Accepter les images et les PDFs
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|pdf)$/)) {
          return callback(new Error('Only image files and PDFs are allowed!'), false);
        }
        callback(null, true);
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max
      },
    }),
  ],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [MulterModule, UploadService],
})
export class UploadModule {}