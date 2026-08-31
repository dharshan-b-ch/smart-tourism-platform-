const mongoose = require('mongoose');

const emergencyFacilitySchema = new mongoose.Schema({
  destinationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Destination', required: true },
  type: { type: String, enum: ['police', 'hospital', 'fire', 'other'] },
  name: { type: String, required: true },
  contact: { type: String },
  location: { type: String },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number }
  }
}, { timestamps: true });

module.exports = mongoose.model('EmergencyFacility', emergencyFacilitySchema);
