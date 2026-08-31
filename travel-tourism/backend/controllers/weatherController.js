const weatherService = require('../services/weatherService');
const intelligenceService = require('../services/intelligenceService');

exports.getWeather = async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ success: false, message: 'Latitude and longitude are required' });
    }

    const weatherData = await weatherService.fetchWeatherData(lat, lon);
    const trafficData = intelligenceService.getTrafficIntelligence();
    const crowdData = intelligenceService.getCrowdIntelligence();

    res.status(200).json({
      success: true,
      data: {
        weather: weatherData,
        traffic: trafficData,
        crowd: crowdData
      }
    });

  } catch (error) {
    console.error('Weather Controller Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch intelligence data.'
    });
  }
};
