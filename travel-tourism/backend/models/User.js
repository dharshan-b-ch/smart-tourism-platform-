const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['ADMIN', 'TOURIST', 'GUIDE', 'PHOTOGRAPHER'],
    required: true,
    uppercase: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'],
    default: 'APPROVED',
    uppercase: true
  },
  phone: { type: String },
  profileImage: { type: String },
  
  // Guide Specific Fields
  serviceLocation: { type: String },
  languages: [{ type: String }],
  experience: { type: String },
  description: { type: String },
  availability: { type: String, default: 'Available' },

  // Photographer Specific Fields
  photographyType: { type: String },
  portfolio: [{ type: String }],

  // Tourist Specific Fields
  preferredLanguage: { type: String, default: 'English' },
  favorites: {
    destinations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Destination' }],
    places: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TouristPlace' }]
  }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
