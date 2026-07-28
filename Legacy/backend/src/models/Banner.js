import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    ctaLabel: { type: String, trim: true },
    ctaHref: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }
  },
  { timestamps: true }
);

export const Banner = mongoose.models.Banner || mongoose.model('Banner', bannerSchema);
