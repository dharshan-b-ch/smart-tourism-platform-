const express = require('express');
const { generateItinerary, chatAssistant } = require('../controllers/aiController');
const { getWeather } = require('../controllers/weatherController');
const { geocode, reverseGeocode } = require('../controllers/locationController');

const router = express.Router();

router.post('/itinerary', generateItinerary);
router.post('/chat', chatAssistant);
router.get('/weather', getWeather);
router.get('/geocode', geocode);
router.get('/reverse-geocode', reverseGeocode);

module.exports = router;
