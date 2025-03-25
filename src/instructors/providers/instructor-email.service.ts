import { Injectable, Logger } from "@nestjs/common"

@Injectable()
export class InstructorEmailService {
  private readonly logger = new Logger(InstructorEmailService.name)

  async sendInstructorCredentials(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    schoolName: string,
  ): Promise<void> {
    // Version simplifiée qui ne fait que logger les informations
    this.logger.log(`[MOCK] Email would be sent to: ${email}`)
    this.logger.log(`[MOCK] Credentials: Email=${email}, Password=${password}`)
    this.logger.log(`[MOCK] Welcome message for ${firstName} ${lastName} to ${schoolName}`)

    // Dans un environnement de production, vous utiliseriez nodemailer ici
  }
}

