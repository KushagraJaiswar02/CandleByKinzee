import mongoose from 'mongoose';

const cancellationTicketSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, index: true },
    customer: {
      name: { type: String, required: true },
      email: { type: String },
      phone: { type: String }
    },
    reason: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
    resolvedAt: Date
  },
  { timestamps: true }
);

export const CancellationTicket = mongoose.models.CancellationTicket || mongoose.model('CancellationTicket', cancellationTicketSchema);
