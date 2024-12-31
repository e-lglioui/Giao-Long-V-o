import { Schema } from 'mongoose';

const ProfileSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  photo: { type: String },
  grade: { type: String },
  performanceHistory: [{ type: String }],
  goals: [{ type: String }],
  badges: [{ title: String, date: Date }],
}, { timestamps: true });

export default ProfileSchema;
