import { Schema } from 'mongoose';

const MessageSchema = new Schema({
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: Schema.Types.ObjectId, ref: 'User' },
  groupId: { type: Schema.Types.ObjectId, ref: 'Group' },
  content: { type: String, required: true },
  attachments: [{ type: String }],
}, { timestamps: true });

export default MessageSchema;
