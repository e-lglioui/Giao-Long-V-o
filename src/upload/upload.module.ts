import { Module } from "@nestjs/common"
import { MulterModule } from "@nestjs/platform-express"
import { diskStorage } from "multer"
import { extname } from "path"
import { UploadController } from "./upload.controller"
import { UploadService } from "./upload.service"
import { existsSync, mkdirSync } from "fs"

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: (req, file, callback) => {
          let uploadPath = "./uploads"

          // Different directory based on file type
          if (file.mimetype.includes("image")) {
            uploadPath = "./uploads/images"
          } else if (file.mimetype.includes("pdf")) {
            uploadPath = "./uploads/documents"
          }

          // Create directory if it doesn't exist
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true })
          }

          callback(null, uploadPath)
        },
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
          const ext = extname(file.originalname)
          const fileType = file.mimetype.includes("image") ? "image" : "document"
          callback(null, `${fileType}-${uniqueSuffix}${ext}`)
        },
      }),
      fileFilter: (req, file, callback) => {
        // Accept images and PDFs
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|pdf)$/)) {
          return callback(new Error("Only image files and PDFs are allowed!"), false)
        }
        callback(null, true)
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

