import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document, Schema as MongooseSchema } from "mongoose"

export class Certification {
  @Prop({ required: true })
  name: string

  @Prop()
  issuingOrganization?: string

  @Prop()
  issueDate?: string

  @Prop()
  expiryDate?: string
  
  @Prop()
  certificateFile?: string // Chemin vers le fichier PDF
}

@Schema({
  collection: "instructor_profiles",
  timestamps: true,
})
export class InstructorProfile extends Document {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  })
  userId: MongooseSchema.Types.ObjectId

  @Prop({ required: false })
  bio?: string

  @Prop({ required: false })
  phone?: string

  @Prop({ required: false })
  address?: string

  @Prop({ type: [String], default: [] })
  specialties?: string[]

  @Prop({ type: [Object], default: [] })
  certifications?: Certification[]

  @Prop({ required: false })
  yearsOfExperience?: number
  
  // Nouveaux champs
  @Prop({ type: [String], default: [] })
  profileImages: string[]
  
  @Prop()
  sportsPassport?: string // Chemin vers le fichier PDF
  
  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'School', default: [] })
  schools: MongooseSchema.Types.ObjectId[]
}

export const InstructorProfileSchema = SchemaFactory.createForClass(InstructorProfile)

