import mongoose from 'mongoose';

const quoteRequestSchema = new mongoose.Schema(
  {
    customer: {
      name: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true, index: true },
      email: { type: String, trim: true, lowercase: true }
    },
    description: { type: String, required: true, trim: true },
    referenceImages: [{ type: String, trim: true }],
    status: {
      type: String,
      enum: ['pending', 'quoted', 'accepted', 'declined'],
      default: 'pending',
      index: true
    },
    quotedPrice: { type: Number, min: 0 },
    quotedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }
  },
  { timestamps: true }
);

export const QuoteRequest = mongoose.models.QuoteRequest || mongoose.model('QuoteRequest', quoteRequestSchema);
