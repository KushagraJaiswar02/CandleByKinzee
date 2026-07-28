import mongoose from 'mongoose';
import { CATEGORIES } from '../constants.js';

const customOptionSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    choices: [{ type: String, required: true, trim: true }],
    surcharges: { type: Map, of: Number, default: {} }
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    images: [{ type: String, trim: true }],
    basePrice: { type: Number, required: true, min: 0 },
    category: { type: String, enum: CATEGORIES, required: true, index: true },
    customizable: { type: Boolean, default: true },
    customOptions: [customOptionSchema],
    isActive: { type: Boolean, default: true, index: true },
    lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }
  },
  { timestamps: true }
);

export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
