import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['owner', 'staff'], default: 'staff' },
    failedLoginAttempts: { type: Number, default: 0 },
    lockedUntil: Date
  },
  { timestamps: true }
);

export const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);
