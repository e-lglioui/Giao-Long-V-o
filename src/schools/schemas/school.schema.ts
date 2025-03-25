import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import mongoose, { Document, Schema as MongooseSchema } from "mongoose"
import type { User } from "../../users/schemas/user.schema"
import type { Student } from "../../students/schemas/student.schema"

export class Schedule {
  @Prop({ required: true })
  openingTime: string

  @Prop({ required: true })
  closingTime: string

  @Prop({ type: [String], default: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] })
  operatingDays: string[]
}

export class Location {
  @Prop({ type: Number })
  latitude: number

  @Prop({ type: Number })
  longitude: number
}

@Schema({ timestamps: true })
export class School extends Document {
  @Prop({ required: true, default: undefined }) // Explicitly set default to undefined
  name: string

  @Prop()
  address: string

  @Prop()
  description: string

  @Prop()
  contactNumber: string

  @Prop({ type: [String], default: [] })
  images: string[]

  @Prop({ type: Number, default: 1000 })
  maxStudents: number

  @Prop({ type: Schedule, default: { openingTime: "08:00", closingTime: "16:00" } })
  schedule: Schedule

  @Prop({ type: Location })
  location: Location

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: "User" }] })
  instructors: User[]

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: "User" }] })
  students: User[]

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: "Student" }] })
  studentReferences: Student[]

  @Prop({
    type: {
      studentCount: { type: Number, default: 0 },
      revenue: { type: Number, default: 0 },
      performanceStats: { type: Map, of: Number },
    },
  })
  dashboard: {
    studentCount: number
    revenue: number
    performanceStats: Map<string, number>
  }

  @Prop({ type: Number, default: 0 })
  enrollmentFee: number

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "User" })
  adminId: mongoose.Schema.Types.ObjectId
}

export const SchoolSchema = SchemaFactory.createForClass(School)

// Add a 2dsphere index for geospatial queries
SchoolSchema.index({ "location.latitude": 1, "location.longitude": 1 })