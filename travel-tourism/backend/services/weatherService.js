const axios = require('axios');

exports.fetchWeatherData = async (lat, lon) => {
  if (!process.env.WEATHER_API_KEY) {
    return generateFallbackWeather();
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.WEATHER_API_KEY}&units=metric`;
    const response = await axios.get(url);
    const data = response.data;
    
    return processWeatherData(data);
  } catch (error) {
    console.error('Weather API Error:', error.message);
    return generateFallbackWeather();
  }
};

const processWeatherData = (data) => {
  const temp = data.main.temp;
  const condition = data.weather[0].main;
  const visibility = data.visibility; // meters
  const humidity = data.main.humidity;
  const wind = data.wind.speed;
  const clouds = data.clouds.all; // percentage

  // Rain calculations
  let rainProb = 0;
  let rainIntensity = 'None';
  if (condition.includes('Rain')) {
    rainProb = 80;
    rainIntensity = 'Moderate to Heavy';
  } else if (clouds > 70) {
    rainProb = 40;
    rainIntensity = 'Possible Drizzle';
  }

  // Mountain Visibility Logic
  let mountainVisibility = '🟢 Excellent View';
  let expectedView = 'Clear visibility of surrounding mountains.';
  if (visibility < 1000 || clouds > 90 || rainProb > 70) {
    mountainVisibility = '🔴 Very Low Visibility';
    expectedView = 'Heavy cloud coverage and rain will hide parts of the mountain. Wait for clearer weather.';
  } else if (visibility < 4000 || clouds > 60) {
    mountainVisibility = '🟠 Partial View';
    expectedView = 'Some clouds may obstruct distant views.';
  }

  // Sky Condition
  let skyCondition = '☀️ Clear Sky';
  if (clouds > 85) skyCondition = '☁️ Overcast';
  else if (clouds > 50) skyCondition = '⛅ Partly Cloudy';
  else if (condition.includes('Rain')) skyCondition = '🌧️ Rain Clouds';
  
  // Travel Risk Score
  let riskScore = 95; // 100 is best
  if (rainProb > 50) riskScore -= 20;
  if (visibility < 2000) riskScore -= 30;
  if (wind > 10) riskScore -= 10;
  
  let travelCondition = '🟢 GOOD FOR TRAVEL';
  if (riskScore < 50) travelCondition = '🔴 OFFICIAL WARNING / AVOID IF ADVISED BY AUTHORITIES';
  else if (riskScore < 70) travelCondition = '🟠 CONDITIONS MAY AFFECT TRAVEL';
  else if (riskScore < 85) travelCondition = '🟡 TRAVEL WITH CAUTION';

  return {
    isFallback: false,
    temp,
    condition,
    visibility: (visibility / 1000).toFixed(1) + ' km',
    humidity,
    wind,
    clouds,
    rainProb,
    rainIntensity,
    mountainVisibility,
    expectedView,
    skyCondition,
    travelCondition,
    riskScore,
    lastUpdated: new Date().toISOString()
  };
};

const generateFallbackWeather = () => {
  return {
    isFallback: true,
    temp: 22,
    condition: 'Cloudy',
    visibility: '4.2 km',
    humidity: 78,
    wind: 3.5,
    clouds: 85,
    rainProb: 65,
    rainIntensity: 'Moderate',
    mountainVisibility: '🟠 Partial View',
    expectedView: 'Heavy cloud coverage and rain may hide parts of the mountain.',
    skyCondition: '☁️ Overcast',
    travelCondition: '🟡 TRAVEL WITH CAUTION',
    riskScore: 72,
    lastUpdated: new Date().toISOString(),
    source: 'Fallback Demo Data'
  };
};
