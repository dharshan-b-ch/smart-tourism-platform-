const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  destinationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Destination', required: true },
  cuisine: [{ type: String }],
  isVegOnly: { type: Boolean, default: false },
  location: { type: String },
  contact: { type: String },
  priceCategory: { type: String, enum: ['low', 'medium', 'high'] },
  imageUrl: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Restaurant', restaurantSchema);
