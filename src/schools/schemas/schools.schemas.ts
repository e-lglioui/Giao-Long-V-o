import { Schema } from 'mongoose';

const SchoolSchema = new Schema({
  name: { type: String, required: true },
  address: { type: String },
  contactNumber: { type: String },
  instructors: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  students: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  dashboard: {
    studentCount: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    performanceStats: { type: Map, of: Number },
  },
}, { timestamps: true });

export default SchoolSchema;
