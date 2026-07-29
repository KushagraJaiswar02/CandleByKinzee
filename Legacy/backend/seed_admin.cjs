const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://127.0.0.1:27017/candlewithkinzee').then(async () => {
  const Admin = mongoose.models.Admin || mongoose.model('Admin', new mongoose.Schema({ 
    email: String, 
    passwordHash: String, 
    role: String,
    failedLoginAttempts: Number,
    lockedUntil: Date
  }));
  
  await Admin.deleteMany({});
  
  const hash = bcrypt.hashSync('yashyash', 10);
  
  await Admin.create({ 
    email: 'yash@gmail.com', 
    passwordHash: hash,
    role: 'owner',
    failedLoginAttempts: 0,
    lockedUntil: null
  });
  
  console.log('Admin seeded correctly with valid hash!');
  process.exit(0);
}).catch(console.error);
