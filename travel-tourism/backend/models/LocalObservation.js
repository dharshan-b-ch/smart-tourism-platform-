const mongoose = require('mongoose');

const localObservationSchema = new mongoose.Schema({
  destinationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Destination', required: true },
  reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reporterRole: { type: String, required: true },
  category: { type: String, required: true }, // e.g. Heavy Rain, Traffic, Road Blocked
  location: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['Pending Verification', 'Verified', 'Rejected'], default: 'Pending Verification' },
  reportDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('LocalObservation', localObservationSchema);
