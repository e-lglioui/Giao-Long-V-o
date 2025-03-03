import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document, Schema as MongooseSchema } from "mongoose"
import type { User } from "../../users/schemas/user.schema"
import type { School } from "../../schools/schemas/school.schema"
import type { Class } from "../../classes/schemas/class.schema"

export enum EnrollmentStatus {
  PENDING = "pending",
  ACTIVE = "active",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

@Schema({ timestamps: true })
export class Enrollment extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", required: true })
  studentId: User

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "School", required: true })
  schoolId: School

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: "Class" }], default: [] })
  classes: Class[]

  @Prop({ required: true, default: new Date() })
  enrollmentDate: Date

  @Prop({ type: String, enum: EnrollmentStatus, default: EnrollmentStatus.ACTIVE })
  status: EnrollmentStatus

  @Prop({ type: Date })
  completionDate: Date

  @Prop({ type: Object, default: {} })
  paymentDetails: Record<string, any>

  @Prop({ type: [String], default: [] })
  notes: string[]
}

export const EnrollmentSchema = SchemaFactory.createForClass(Enrollment)

// Add indexes for better query performance
EnrollmentSchema.index({ studentId: 1, schoolId: 1 }, { unique: true })
EnrollmentSchema.index({ status: 1 })

