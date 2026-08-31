const express = require('express');
const Destination = require('../models/Destination');
const router = express.Router();

// Get all destinations
router.get('/', async (req, res) => {
  try {
    const destinations = await Destination.find({});
    res.json({ success: true, data: destinations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get destination by ID
router.get('/:id', async (req, res) => {
  try {
    const TouristPlace = require('../models/TouristPlace');
    const destination = await Destination.findById(req.params.id).lean();
    if (!destination) return res.status(404).json({ success: false, message: 'Not found' });
    
    // Fetch places for this destination
    const places = await TouristPlace.find({ destinationId: req.params.id });
    destination.places = places;

    res.json({ success: true, data: destination });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
