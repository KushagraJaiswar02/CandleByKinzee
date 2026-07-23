import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  label: { type: String, required: true, trim: true }, // e.g. Home, Office
  fullName: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  street: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  zip: { type: String, required: true, trim: true }
});

const customerSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, unique: true, trim: true, index: true },
    name: { type: String, trim: true, default: '' },
    email: { type: String, trim: true, lowercase: true, default: '' },
    savedAddresses: [addressSchema]
  },
  { timestamps: true }
);

export const Customer = mongoose.models.Customer || mongoose.model('Customer', customerSchema);
