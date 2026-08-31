const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  location: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, default: 'India' },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number }
  },
  description: { type: String, required: true },
  imageUrl: { type: String },
  bestAttractions: [{ type: String }],
  popularActivities: [{ type: String }],
  localExperiences: [{ type: String }],

  // Rich City Intelligence Fields
  recommendedHotels: [{
    name: { type: String },
    rating: { type: String },
    priceRange: { type: String },
    address: { type: String },
    imageUrl: { type: String }
  }],

  famousFoods: [{
    dishName: { type: String },
    description: { type: String },
    isVeg: { type: Boolean, default: true },
    imageUrl: { type: String }
  }],

  dayByDayHighlights: [{
    dayNumber: { type: Number },
    title: { type: String },
    placeName: { type: String },
    description: { type: String },
    bestTimeToVisit: { type: String }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Destination', destinationSchema);
