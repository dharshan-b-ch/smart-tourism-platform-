// Mock Service for Traffic and Crowds

exports.getTrafficIntelligence = () => {
  // Simulating data since real free APIs for hyper-local traffic don't exist
  return {
    currentTraffic: '🟠 Heavy Traffic',
    normalJourney: '35 minutes',
    estimatedNow: '58 minutes',
    delay: '23 minutes',
    lastUpdated: new Date().toISOString(),
    source: 'Simulated Map/Traffic Provider'
  };
};

exports.getCrowdIntelligence = () => {
  return {
    currentCrowd: '🟠 High',
    expected: 'High crowd during evening hours.',
    forecast: {
      morning: '🟢 Low',
      afternoon: '🟡 Moderate',
      evening: '🟠 High',
      night: '🟢 Low'
    },
    lastUpdated: new Date().toISOString(),
    source: 'Historical Data Estimates'
  };
};
