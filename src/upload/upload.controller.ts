import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
  Param,
  Get,
  Res,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from "@nestjs/common"
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express"
import { Express } from "express"
import { UploadService } from "./upload.service"
import { join } from "path"
import { Response } from "express"

@Controller("upload")
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('image'))
  uploadSingleImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
      }),
    ) file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Aucun fichier image trouvé');
    }

    return {
      statusCode: 200,
      message: 'Image téléchargée avec succès',
      data: {
        originalname: file.originalname,
        filename: file.filename,
        path: `/images/${file.filename}`,
      },
    };
  }

  @Post('document')
  @UseInterceptors(FileInterceptor('document'))
  uploadDocument(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: '.(pdf)' }),
        ],
      }),
    ) file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Aucun fichier PDF trouvé');
    }

    return {
      statusCode: 200,
      message: 'Document téléchargé avec succès',
      data: {
        originalname: file.originalname,
        filename: file.filename,
        path: `/documents/${file.filename}`,
      },
    };
  }

  @Post('images')
  @UseInterceptors(FilesInterceptor('images', 10))
  uploadMultipleImages(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Aucun fichier image trouvé');
    }

    const uploadedFiles = files.map(file => ({
      originalname: file.originalname,
      filename: file.filename,
      path: `/images/${file.filename}`,
    }));

    return {
      statusCode: 200,
      message: `${files.length} images téléchargées avec succès`,
      data: uploadedFiles,
    };
  }

  @Get("images/:filename")
  getImage(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = join(process.cwd(), "uploads/images", filename)
    console.log(`Serving image: ${filePath}`)
    return res.sendFile(filePath)
  }

  @Get("documents/:filename")
  getDocument(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = join(process.cwd(), "uploads/documents", filename)
    console.log(`Serving document: ${filePath}`)
    return res.sendFile(filePath)
  }
}

