import { Schema } from 'mongoose';

const EventSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  date: { type: Date, required: true },
  location: { type: String },
  participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  fees: { type: Number, default: 0 },
}, { timestamps: true });

export default EventSchema;
