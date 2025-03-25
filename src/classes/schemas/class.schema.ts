import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document, Schema as MongooseSchema } from "mongoose"
import type { User } from "../../users/schemas/user.schema"
import type { School } from "../../schools/schemas/school.schema"
import type { Course } from "../../courses/schemas/courses.schema"

export enum ClassStatus {
  SCHEDULED = "scheduled",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

@Schema({ timestamps: true })
export class Class extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "School", required: true })
  schoolId: School

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Course", required: true })
  courseId: Course

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", required: true })
  instructorId: User

  @Prop({ required: true })
  title: string

  @Prop()
  description: string

  @Prop({ required: true })
  date: Date

  @Prop({ required: true })
  startTime: string

  @Prop({ required: true })
  endTime: string

  @Prop({ type: String, enum: ClassStatus, default: ClassStatus.SCHEDULED })
  status: ClassStatus

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: "User" }], default: [] })
  enrolledStudents: User[]

  @Prop({ min: 1, default: 20 })
  maxCapacity: number

  @Prop({ default: 0 })
  currentEnrollment: number

  @Prop({ type: String, default: "Beginner" })
  level: string

  @Prop({ type: [String], default: [] })
  requirements: string[]

  @Prop({ type: Map, of: String, default: {} })
  metadata: Map<string, string>
}

export const ClassSchema = SchemaFactory.createForClass(Class)

// Add indexes for better query performance
ClassSchema.index({ schoolId: 1, date: 1 })
ClassSchema.index({ instructorId: 1 })
ClassSchema.index({ courseId: 1 })
ClassSchema.index({ status: 1 })

