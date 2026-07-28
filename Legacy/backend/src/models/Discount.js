import mongoose from 'mongoose';

const discountSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    percentage: { type: Number, required: true, min: 1, max: 90 },
    minimumOrderValue: { type: Number, default: 0, min: 0 },
    expiresAt: Date,
    usageCap: { type: Number, min: 1 },
    usedCount: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
    lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }
  },
  { timestamps: true }
);

export const Discount = mongoose.models.Discount || mongoose.model('Discount', discountSchema);
