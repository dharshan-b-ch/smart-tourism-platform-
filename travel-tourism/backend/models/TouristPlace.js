const mongoose = require('mongoose');

const touristPlaceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  destinationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Destination', required: true },
  description: { type: String },
  imageUrl: { type: String },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number }
  },
  category: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('TouristPlace', touristPlaceSchema);
