// upload/upload.service.ts
import { Injectable } from "@nestjs/common"
import { existsSync, mkdirSync } from "fs"
import { join } from "path"

@Injectable()
export class UploadService {
  constructor() {
    // Créer le dossier uploads s'il n'existe pas
    const uploadPath = join(process.cwd(), "uploads")
    if (!existsSync(uploadPath)) {
      mkdirSync(uploadPath, { recursive: true })
    }

    // Avant de démarrer l'application
    const uploadPaths = ["./uploads", "./uploads/images", "./uploads/documents"]
    uploadPaths.forEach((path) => {
      if (!existsSync(path)) {
        mkdirSync(path, { recursive: true })
      }
    })
  }

  getFilePath(filename: string): string {
    return join(process.cwd(), "uploads", filename)
  }
}

