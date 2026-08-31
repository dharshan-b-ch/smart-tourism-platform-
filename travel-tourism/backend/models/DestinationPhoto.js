const mongoose = require('mongoose');

const destinationPhotoSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  destinationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Destination', required: true },
  uploaderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  uploaderRole: { type: String, required: true },
  location: { type: String },
  description: { type: String },
  status: { type: String, enum: ['Pending Verification', 'Verified', 'Rejected'], default: 'Pending Verification' },
  uploadDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('DestinationPhoto', destinationPhotoSchema);
