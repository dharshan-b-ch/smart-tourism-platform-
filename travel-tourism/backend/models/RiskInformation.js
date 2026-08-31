const mongoose = require('mongoose');

const riskInformationSchema = new mongoose.Schema({
  destinationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Destination', required: true },
  riskLevel: { type: String, enum: ['Low', 'Medium', 'High'] },
  category: { type: String },
  description: { type: String },
  safetyRecommendations: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('RiskInformation', riskInformationSchema);
