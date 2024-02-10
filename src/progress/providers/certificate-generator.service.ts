import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';
import { Progress, GradeLevel } from '../schemas/progress.schema';

@Injectable()
export class CertificateGeneratorService {
  private readonly certificatesPath: string;

  constructor(private readonly configService: ConfigService) {
    this.certificatesPath = this.configService.get('CERTIFICATES_PATH') || 'uploads/certificates';
    if (!fs.existsSync(this.certificatesPath)) {
      fs.mkdirSync(this.certificatesPath, { recursive: true });
    }
  }

  async generateCertificate(
    progress: Progress,
    examiner: string,
    date: Date
  ): Promise<string> {
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape'
    });

    const fileName = `certificate_${progress.studentId}_${progress.currentGrade}_${date.getTime()}.pdf`;
    const filePath = path.join(this.certificatesPath, fileName);
    const writeStream = fs.createWriteStream(filePath);

    doc.pipe(writeStream);

    // Ajouter le contenu du certificat
    this.addCertificateContent(doc, progress, examiner, date);

    doc.end();

    return new Promise((resolve, reject) => {
      writeStream.on('finish', () => {
        resolve(filePath);
      });
      writeStream.on('error', reject);
    });
  }

  private addCertificateContent(
    doc: PDFKit.PDFDocument,
    progress: Progress,
    examiner: string,
    date: Date
  ): void {
    // Ajouter le logo et le fond
    this.addBackground(doc);

    // Ajouter le titre
    doc.fontSize(36)
       .font('Helvetica-Bold')
       .text('Certificate of Achievement', 0, 100, { align: 'center' });

    // Ajouter le texte principal
    doc.fontSize(18)
       .font('Helvetica')
       .text(
         `This is to certify that\n\n` +
         `${progress.studentId}\n\n` +
         `has successfully achieved the grade of\n\n` +
         `${this.formatGrade(progress.currentGrade)}\n\n` +
         `on ${date.toLocaleDateString()}\n\n` +
         `Examiner: ${examiner}`,
         100,
         200,
         { align: 'center' }
       );

    // Ajouter les signatures
    this.addSignatures(doc);
  }

  private addBackground(doc: PDFKit.PDFDocument): void {
    // Ajouter un fond décoratif
    doc.rect(0, 0, doc.page.width, doc.page.height)
       .fill('#f0f0f0');

    // Ajouter une bordure
    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
       .stroke();
  }

  private addSignatures(doc: PDFKit.PDFDocument): void {
    // Ajouter les lignes de signature
    const signatureY = doc.page.height - 150;
    
    doc.fontSize(12)
       .text('_________________', 150, signatureY, { align: 'center' })
       .text('Examiner', 150, signatureY + 20, { align: 'center' })
       .text('_________________', doc.page.width - 150, signatureY, { align: 'center' })
       .text('School Director', doc.page.width - 150, signatureY + 20, { align: 'center' });
  }

  private formatGrade(grade: GradeLevel): string {
    return grade.replace('_', ' ').split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
} 