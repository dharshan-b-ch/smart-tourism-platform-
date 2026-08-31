import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Navigation, Map as MapIcon, Satellite, Compass, Activity, ShieldCheck, Play, Square } from 'lucide-react';

// Fix default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Helper function to convert heading degrees to compass direction string
const getCompassDirection = (heading) => {
  if (heading === null || heading === undefined) return 'NORTH (0°)';
  const directions = [
    { name: 'NORTH 🧭', min: 337.5, max: 360 },
    { name: 'NORTH 🧭', min: 0, max: 22.5 },
    { name: 'NORTH-EAST 🧭', min: 22.5, max: 67.5 },
    { name: 'EAST 🧭', min: 67.5, max: 112.5 },
    { name: 'SOUTH-EAST 🧭', min: 112.5, max: 157.5 },
    { name: 'SOUTH 🧭', min: 157.5, max: 202.5 },
    { name: 'SOUTH-WEST 🧭', min: 202.5, max: 247.5 },
    { name: 'WEST 🧭', min: 247.5, max: 292.5 },
    { name: 'NORTH-WEST 🧭', min: 292.5, max: 337.5 },
  ];

  const normalized = (heading % 360 + 360) % 360;
  const found = directions.find(d => normalized >= d.min && normalized < d.max);
  return `${found ? found.name : 'NORTH'} (${Math.round(normalized)}°)`;
};

// Custom Leaflet Direction Marker Icon with Rotating Compass Beam
const createDirectionIcon = (heading = 0) => {
  return L.divIcon({
    className: 'custom-live-user-marker',
    html: `
      <div style="position: relative; width: 44px; height: 44px; display: flex; items-center; justify-content: center;">
        <!-- Direction Cone Beam -->
        <div style="
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%) rotate(${heading}deg);
          transform-origin: bottom center;
          width: 0;
          height: 0;
          border-left: 14px solid transparent;
          border-right: 14px solid transparent;
          border-bottom: 30px solid rgba(59, 130, 246, 0.45);
          filter: drop-shadow(0 0 6px rgba(59,130,246,0.6));
          pointer-events: none;
        "></div>
        <!-- Pulsing Blue User Circle -->
        <div style="
          width: 22px;
          height: 22px;
          background-color: #2563eb;
          border: 3px solid #ffffff;
          border-radius: 50%;
          box-shadow: 0 0 12px rgba(37, 99, 235, 0.8), 0 0 0 8px rgba(37, 99, 235, 0.25);
          z-index: 10;
        "></div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
};

// Sub-component to sync map view to user location continuous position
const MapFollower = ({ location, isFollowing }) => {
  const map = useMap();
  useEffect(() => {
    if (isFollowing && location) {
      map.panTo([location.lat, location.lng], { animate: true, duration: 0.5 });
    }
  }, [location, isFollowing, map]);
  return null;
};

// Sub-component to fly to specific target coordinates on trigger
const MapFlyTo = ({ target }) => {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo([target.lat, target.lng], 14, { animate: true, duration: 1.2 });
    }
  }, [target, map]);
  return null;
};

const MapComponent = ({ center, title, places }) => {
  const [mapType, setMapType] = useState('satellite'); // 'satellite' | 'roadmap'
  const [userLocation, setUserLocation] = useState(null);
  const [heading, setHeading] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [isLiveTracking, setIsLiveTracking] = useState(false);
  const [isFollowing, setIsFollowing] = useState(true);
  const [directionMode, setDirectionMode] = useState(false);
  const [flyTarget, setFlyTarget] = useState(null);

  const [showPlaces, setShowPlaces] = useState(true);
  const [showHotels, setShowHotels] = useState(false);
  const [showTraffic, setShowTraffic] = useState(false);

  const watchIdRef = useRef(null);
  const prevCoordsRef = useRef(null);

  // Toggle map layers
  useEffect(() => {
    const handleToggle = (e) => {
      if (e.detail === 'places') setShowPlaces(!showPlaces);
      if (e.detail === 'hotels') setShowHotels(!showHotels);
      if (e.detail === 'traffic') setShowTraffic(!showTraffic);
    };
    window.addEventListener('toggle-map-layer', handleToggle);
    return () => window.removeEventListener('toggle-map-layer', handleToggle);
  }, [showPlaces, showHotels, showTraffic]);

  // Handle Device Orientation / Compass Heading
  useEffect(() => {
    const handleOrientation = (event) => {
      let compassHeading = null;
      if (event.webkitCompassHeading) {
        compassHeading = event.webkitCompassHeading;
      } else if (event.alpha !== null && event.alpha !== undefined) {
        compassHeading = 360 - event.alpha;
      }
      if (compassHeading !== null) {
        setHeading(compassHeading);
      }
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }
    return () => {
      if (window.DeviceOrientationEvent) {
        window.removeEventListener('deviceorientation', handleOrientation, true);
      }
    };
  }, []);

  // Start continuous Live GPS watchPosition tracking second-by-second
  const startLiveTracking = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLiveTracking(true);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude: lat, longitude: lng, heading: gpsHeading, speed: gpsSpeed } = position.coords;

        setUserLocation({ lat, lng });

        if (gpsSpeed !== null && gpsSpeed !== undefined) {
          setSpeed(Math.round(gpsSpeed * 3.6));
        }

        if (gpsHeading !== null && !isNaN(gpsHeading)) {
          setHeading(gpsHeading);
        } else if (prevCoordsRef.current) {
          const dy = lat - prevCoordsRef.current.lat;
          const dx = lng - prevCoordsRef.current.lng;
          if (Math.abs(dx) > 0.00001 || Math.abs(dy) > 0.00001) {
            const angle = Math.atan2(dx, dy) * (180 / Math.PI);
            setHeading((angle + 360) % 360);
          }
        }
        prevCoordsRef.current = { lat, lng };
      },
      (err) => {
        console.error("GPS Watch error:", err);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      }
    );
  };

  const stopLiveTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsLiveTracking(false);
  };

  const toggleTracking = () => {
    if (isLiveTracking) {
      stopLiveTracking();
    } else {
      startLiveTracking();
    }
  };

  // DIRECTION MODE: Pans map directly to User's Live Position with compass beam
  const handleDirectionMode = () => {
    setDirectionMode(true);
    setIsFollowing(true);

    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(coords);
        setFlyTarget({ ...coords, ts: Date.now() });
      },
      (err) => {
        alert('Could not get live location: ' + err.message);
      },
      { enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    startLiveTracking();
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const demoHotels = [
    { name: "Grand Residency", lat: center.lat + 0.01, lng: center.lng + 0.01, rating: "4.5★" },
    { name: "Budget Inn", lat: center.lat - 0.01, lng: center.lng - 0.01, rating: "3.8★" }
  ];

  const getTileUrl = () => {
    let layer = mapType === 'satellite' ? 'y' : 'm';
    if (showTraffic) layer += ',traffic';
    return `https://mt1.google.com/vt/lyrs=${layer}&x={x}&y={y}&z={z}`;
  };

  return (
    <div className="relative space-y-3">
      
      {/* Map Control Header */}
      <div className="flex justify-between items-center flex-wrap gap-2 z-[400] relative">
        <div className="flex gap-2">
          <button 
            type="button"
            onClick={() => setMapType('satellite')}
            className={`flex items-center px-3 py-1.5 rounded-xl shadow-md text-xs font-bold transition-colors ${mapType === 'satellite' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
          >
            <Satellite className="w-3.5 h-3.5 mr-1" /> Satellite
          </button>
          <button 
            type="button"
            onClick={() => setMapType('roadmap')}
            className={`flex items-center px-3 py-1.5 rounded-xl shadow-md text-xs font-bold transition-colors ${mapType === 'roadmap' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
          >
            <MapIcon className="w-3.5 h-3.5 mr-1" /> Road Map
          </button>
        </div>

        {/* DIRECTION MODE & LIVE GPS CONTROLS */}
        <div className="flex gap-2 items-center flex-wrap">
          <button
            type="button"
            onClick={handleDirectionMode}
            className={`flex items-center px-3.5 py-1.5 rounded-xl text-xs font-extrabold shadow-md transition-all ${
              directionMode ? 'bg-indigo-600 text-white ring-2 ring-indigo-400' : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
            title="Direction Mode: Center on My Live Location & Get Turn-by-Turn Directions"
          >
            <Navigation className="w-4 h-4 mr-1.5 transform rotate-45 text-yellow-300" />
            Direction Mode (My Location)
          </button>

          <button
            type="button"
            onClick={toggleTracking}
            className={`flex items-center px-3 py-1.5 rounded-xl shadow-md text-xs font-extrabold transition-all ${
              isLiveTracking ? 'bg-green-600 text-white animate-pulse' : 'bg-gray-800 text-white hover:bg-gray-900'
            }`}
          >
            {isLiveTracking ? <Square className="w-3.5 h-3.5 mr-1" /> : <Play className="w-3.5 h-3.5 mr-1" />}
            {isLiveTracking ? 'GPS Active' : 'Start GPS'}
          </button>

          <button
            type="button"
            onClick={() => setIsFollowing(!isFollowing)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shadow-md transition ${
              isFollowing ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border'
            }`}
            title="Auto-center map on movement"
          >
            🎯 {isFollowing ? 'Following' : 'Free Pan'}
          </button>
        </div>
      </div>

      {/* DIRECTION MODE ROUTE BANNER */}
      {directionMode && userLocation && (
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-black text-white p-3.5 rounded-2xl shadow-xl border border-emerald-400/40 flex justify-between items-center flex-wrap gap-3 text-xs animate-fade-in">
          <div className="flex items-center space-x-2.5">
            <div className="bg-emerald-500/20 p-2 rounded-xl border border-emerald-400/30">
              <Navigation className="w-5 h-5 text-emerald-300 transform rotate-45 animate-pulse" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-emerald-300">🚗 DIRECTION MODE ACTIVE</div>
              <div className="text-gray-300 text-[11px]">
                Your Position (Lat: {userLocation.lat.toFixed(4)}, Lng: {userLocation.lng.toFixed(4)}) ➔ {title || 'Destination'}
              </div>
            </div>
          </div>

          <a
            href={`https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${center.lat},${center.lng}&travelmode=driving`}
            target="_blank"
            rel="noreferrer"
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold px-4 py-2 rounded-xl shadow-lg transition flex items-center gap-1.5 text-xs"
          >
            🗺️ Open Turn-by-Turn Navigation to {title}
          </a>
        </div>
      )}

      {/* Live Geolocation Telemetry Banner */}
      {userLocation && !directionMode && (
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-black text-white px-4 py-2 rounded-2xl shadow-lg flex items-center justify-between flex-wrap gap-3 text-xs font-bold border border-blue-500/30">
          <div className="flex items-center space-x-2">
            <Compass className="w-4 h-4 text-blue-400 animate-spin-slow" />
            <span>Facing Direction: <span className="text-yellow-300 font-extrabold">{getCompassDirection(heading)}</span></span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 text-green-300">
              <Activity className="w-4 h-4" />
              <span>Speed: {speed > 5 ? `${speed} km/h (Vehicle)` : 'Walking / Stationary'}</span>
            </div>

            <div className="flex items-center space-x-1 text-blue-300">
              <ShieldCheck className="w-4 h-4" />
              <span>GPS Lat: {userLocation.lat.toFixed(4)}, Lng: {userLocation.lng.toFixed(4)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Leaflet Map Canvas */}
      <div className="h-96 w-full rounded-2xl overflow-hidden shadow-xl z-10 relative border border-gray-200">
        
        {/* Floating Google Maps-Style Location Arrow Mark Button */}
        <button
          type="button"
          onClick={handleDirectionMode}
          className="absolute top-4 right-4 z-[500] bg-white hover:bg-gray-100 text-blue-600 p-3 rounded-full shadow-2xl border-2 border-blue-600 transition-transform active:scale-95 flex items-center justify-center"
          title="Go to My Current Location & Enable Direction Mode (Location Arrow)"
        >
          <Navigation className="w-5 h-5 text-blue-600 transform rotate-45" />
        </button>

        <MapContainer center={[center.lat, center.lng]} zoom={13} scrollWheelZoom={true} className="h-full w-full">
          <TileLayer
            attribution='&copy; Google Maps'
            url={getTileUrl()}
          />
          
          <MapFollower location={userLocation} isFollowing={isFollowing} />
          <MapFlyTo target={flyTarget} />

          {/* User's Live Vehicle/Walking Location with Compass Cone */}
          {userLocation && (
            <Marker position={[userLocation.lat, userLocation.lng]} icon={createDirectionIcon(heading)}>
              <Popup>
                <div className="font-extrabold text-blue-600 text-sm">📍 Your Live Position</div>
                <div className="text-xs text-gray-600 mt-1 space-y-1">
                  <div><b>Facing:</b> {getCompassDirection(heading)}</div>
                  <div><b>Speed:</b> {speed} km/h</div>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${center.lat},${center.lng}&travelmode=driving`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded mt-1 hover:bg-emerald-700"
                  >
                    🚗 Route to {title}
                  </a>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Main Destination Center */}
          <Marker position={[center.lat, center.lng]}>
            <Popup>
              <div className="font-bold text-gray-900">{title}</div>
              <div className="text-xs text-gray-500">Destination Center</div>
            </Popup>
          </Marker>
          
          {/* Tourist Places */}
          {showPlaces && places && places.map((place, idx) => (
             <Marker key={idx} position={[place.coordinates.lat, place.coordinates.lng]}>
              <Popup>
                <div className="font-bold">{place.name}</div>
                <div className="text-sm mb-2">{place.category || 'Tourist Place'}</div>
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${place.coordinates.lat},${place.coordinates.lng}`}
                  target="_blank" 
                  rel="noreferrer"
                  className="text-[10px] bg-blue-600 text-white px-2 py-1 rounded inline-block font-bold hover:bg-blue-700"
                >
                  Get Turn-by-Turn Directions
                </a>
              </Popup>
            </Marker>
          ))}

          {/* Demo Hotels */}
          {showHotels && demoHotels.map((hotel, idx) => (
             <Marker key={'h'+idx} position={[hotel.lat, hotel.lng]}>
              <Popup>
                <div className="font-bold text-orange-600">🏨 {hotel.name}</div>
                <div className="text-xs mb-2">Rating: {hotel.rating}</div>
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${hotel.lat},${hotel.lng}`}
                  target="_blank" 
                  rel="noreferrer"
                  className="text-[10px] bg-orange-600 text-white px-2 py-1 rounded inline-block font-bold hover:bg-orange-700"
                >
                  Get Directions
                </a>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default MapComponent;
