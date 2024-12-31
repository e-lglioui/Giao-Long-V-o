import { Schema } from 'mongoose';

const CourseSchema = new Schema({
  schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
  instructorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  schedule: [{ date: Date, startTime: String, endTime: String }],
  capacity: { type: Number },
  participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

export default CourseSchema;
