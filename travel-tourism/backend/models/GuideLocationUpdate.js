const mongoose = require('mongoose');

const guideLocationUpdateSchema = new mongoose.Schema({
  guideId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  guideName: { type: String, required: true },
  imageUrl: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  placeName: { type: String },
  destinationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Destination' },
  timestamp: { type: Date, default: Date.now },
  status: { type: String, enum: ['Verified', 'Pending', 'Rejected'], default: 'Verified' }
}, { timestamps: true });

module.exports = mongoose.model('GuideLocationUpdate', guideLocationUpdateSchema);
