const mongoose = require('mongoose');

const transportationSchema = new mongoose.Schema({
  destinationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Destination', required: true },
  type: { type: String, enum: ['bus', 'train', 'taxi', 'flight', 'other'] },
  providerName: { type: String },
  contact: { type: String },
  scheduleInfo: { type: String },
  location: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Transportation', transportationSchema);
