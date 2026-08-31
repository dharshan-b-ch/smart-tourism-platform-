const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  destinationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Destination', required: true },
  location: { type: String },
  priceRange: { type: String },
  facilities: [{ type: String }],
  contact: { type: String },
  rating: { type: Number },
  distance: { type: String },
  imageUrl: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Hotel', hotelSchema);
