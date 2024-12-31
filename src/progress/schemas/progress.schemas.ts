import { Schema } from 'mongoose';

const ProgressSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  grade: { type: String },
  examDate: { type: Date },
  performanceNotes: { type: String },
  certificateUrl: { type: String },
}, { timestamps: true });

export default ProgressSchema;
