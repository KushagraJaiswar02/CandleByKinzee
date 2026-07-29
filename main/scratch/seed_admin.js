const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'mongodb://127.0.0.1:27017/candlewithkinzee';

mongoose.connect(MONGODB_URI)
  .then(async () => {
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

    const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);

    // Drop existing admin accounts to ensure clean state
    await Admin.deleteMany({});
    
    // Hash password '121212'
    const hash = bcrypt.hashSync('121212', 10);
    await Admin.create({
      email: 'yash@gmail.com',
      passwordHash: hash,
      role: 'owner',
      failedLoginAttempts: 0
    });

    console.log('SUCCESS: Admin (yash@gmail.com) seeded successfully into database!');
    process.exit(0);
  })
  .catch(err => {
    console.error('ERROR seeding database:', err);
    process.exit(1);
  });
