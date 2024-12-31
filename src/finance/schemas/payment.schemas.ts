import { Schema } from 'mongoose';

const PaymentSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['paid', 'pending'], default: 'pending' },
  method: { type: String, enum: ['stripe', 'paypal', 'cmi'], required: true },
  invoiceUrl: { type: String },
}, { timestamps: true });

export default PaymentSchema;
