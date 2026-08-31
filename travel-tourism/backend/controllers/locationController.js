const axios = require('axios');

exports.geocode = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }

    // Using Nominatim API (OpenStreetMap) - free, no key required
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'SihTravelTourismApp/1.0 (contact@example.com)'
      }
    });

    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      res.status(200).json({
        success: true,
        data: {
          name: result.display_name,
          lat: parseFloat(result.lat),
          lon: parseFloat(result.lon)
        }
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }

  } catch (error) {
    console.error('Geocoding Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Geocoding service unavailable.'
    });
  }
};

exports.reverseGeocode = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'Lat and Lng are required' });
    }

    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'SihTravelTourismApp/1.0 (contact@example.com)'
      }
    });

    if (response.data) {
      const address = response.data.address || {};
      const cityName = address.city || address.town || address.village || address.county || address.state || response.data.display_name;
      res.status(200).json({
        success: true,
        data: {
          cityName,
          displayName: response.data.display_name,
          lat: parseFloat(lat),
          lng: parseFloat(lng)
        }
      });
    } else {
      res.status(404).json({ success: false, message: 'Address not found' });
    }
  } catch (error) {
    console.error('Reverse Geocoding Error:', error.message);
    res.status(500).json({ success: false, message: 'Reverse geocoding service unavailable.' });
  }
};
