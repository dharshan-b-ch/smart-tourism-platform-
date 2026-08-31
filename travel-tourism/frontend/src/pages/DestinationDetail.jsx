import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import MapComponent from '../components/MapComponent';
import { Loader2, Cloud, CloudRain, AlertTriangle, Info, Mountain, Car, Users, MapPin, Camera, Clock, Hotel, Utensils, Compass } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DestinationDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [dest, setDest] = useState(null);
  const [intelligence, setIntelligence] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [observations, setObservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const destRes = await api.get(`/destinations/${id}`);
        setDest(destRes.data.data);

        try {
          const intelRes = await api.get(`/services/weather?lat=${destRes.data.data.coordinates.lat}&lon=${destRes.data.data.coordinates.lng}`);
          setIntelligence(intelRes.data.data);
        } catch (e) { console.error("Intelligence load failed"); }
        
        try {
          const photosRes = await api.get(`/intelligence/photos/${id}`);
          setPhotos(photosRes.data.data);
        } catch (e) { console.error("Photos load failed"); }

        try {
          const obsRes = await api.get(`/intelligence/observations/${id}`);
          setObservations(obsRes.data.data);
        } catch (e) { console.error("Obs load failed"); }

      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchDetails();
  }, [id]);

  if (loading) return <div className="flex justify-center my-20"><Loader2 className="w-12 h-12 animate-spin text-blue-600" /></div>;
  if (!dest) return <div className="text-center py-20">Destination not found.</div>;

  const w = intelligence?.weather;
  const t = intelligence?.traffic;
  const c = intelligence?.crowd;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Status Banner */}
      {w && (
        <div className={`p-4 text-center font-bold text-lg rounded-lg shadow-sm border ${
          w.travelCondition.includes('GOOD') ? 'bg-green-100 text-green-800 border-green-200' :
          w.travelCondition.includes('CAUTION') ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
          w.travelCondition.includes('AFFECT') ? 'bg-orange-100 text-orange-800 border-orange-200' :
          'bg-red-100 text-red-800 border-red-200'
        }`}>
          {w.travelCondition}
          <div className="text-xs font-normal mt-1 flex items-center justify-center opacity-80">
            <Info className="w-3 h-3 mr-1" />
            Travel Score: {w.riskScore}/100 • Updated {new Date(w.lastUpdated).toLocaleTimeString()}
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative h-[400px] rounded-xl overflow-hidden shadow-lg">
        <img src={dest.imageUrl} alt={dest.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-8">
          <div className="text-white w-full">
            <h1 className="text-5xl font-extrabold mb-2">{dest.name}</h1>
            <p className="text-xl flex items-center"><MapPin className="mr-2" /> {dest.location}, {dest.state}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-2xl font-bold mb-4">About</h2>
            <p className="text-gray-700 leading-relaxed text-lg">{dest.description}</p>
          </section>

          {/* Today's View Photos */}
          <section className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-2xl font-bold mb-4 flex items-center"><Camera className="mr-2 text-blue-600"/> Today's View</h2>
            {photos.length === 0 ? (
              <div className="text-gray-500 italic p-4 bg-gray-50 rounded">No photos uploaded by verified contributors today.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {photos.map(p => (
                  <div key={p._id} className="relative rounded-lg overflow-hidden group">
                    <img src={p.imageUrl} alt="Today" className="w-full h-48 object-cover" />
                    <div className="absolute bottom-0 w-full bg-black/70 text-white p-2 text-xs">
                      <p className="font-bold flex items-center gap-1">✓ {p.uploaderRole.toUpperCase()}</p>
                      <p>By {p.uploaderId?.name} at {new Date(p.uploadDate).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Top Attractions List */}
          {dest.places && dest.places.length > 0 && (
            <section className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-2xl font-bold mb-4">Top Local Attractions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dest.places.map((place, idx) => (
                  <div key={idx} className="flex border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    {place.imageUrl && <img src={place.imageUrl} alt={place.name} className="w-24 h-24 object-cover flex-shrink-0" />}
                    <div className="p-3 flex flex-col justify-center">
                      <h4 className="font-bold text-gray-800">{place.name}</h4>
                      <p className="text-xs text-gray-500 mb-1">{place.category}</p>
                      <p className="text-sm text-gray-600 line-clamp-2">{place.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Day-by-Day Special Places Highlights */}
          {dest.dayByDayHighlights && dest.dayByDayHighlights.length > 0 && (
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
              <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
                <Compass className="w-6 h-6 text-blue-600" /> Day-by-Day Special Places to Visit
              </h2>
              <div className="space-y-4">
                {dest.dayByDayHighlights.map((item, idx) => (
                  <div key={idx} className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="bg-blue-600 text-white text-xs font-extrabold px-2.5 py-1 rounded-full uppercase">Day {item.dayNumber}</span>
                        <span className="font-bold text-gray-900 text-base">{item.title}</span>
                      </div>
                      <p className="text-sm font-semibold text-blue-800">📍 {item.placeName}</p>
                      <p className="text-xs text-gray-600">{item.description}</p>
                      <p className="text-[10px] text-gray-500 font-medium">🕒 Best time: {item.bestTimeToVisit}</p>
                    </div>
                    <a 
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest.name + ' ' + item.placeName)}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1 flex-shrink-0"
                    >
                      🗺️ Directions
                    </a>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Recommended Hotel Suggestions */}
          {dest.recommendedHotels && dest.recommendedHotels.length > 0 && (
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
              <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
                <Hotel className="w-6 h-6 text-amber-600" /> Recommended Hotel Suggestions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {dest.recommendedHotels.map((hotel, idx) => (
                  <div key={idx} className="border rounded-xl overflow-hidden bg-gray-50 flex flex-col justify-between shadow-sm hover:shadow-md transition">
                    {hotel.imageUrl && <img src={hotel.imageUrl} alt={hotel.name} className="w-full h-36 object-cover" />}
                    <div className="p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-gray-900 text-base">{hotel.name}</h4>
                        <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full">{hotel.rating}</span>
                      </div>
                      <p className="text-xs font-semibold text-gray-600">{hotel.priceRange}</p>
                      <p className="text-xs text-gray-500">{hotel.address}</p>
                      <a 
                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(hotel.name + ' ' + dest.name)}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-block w-full text-center bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold py-2 rounded-lg transition mt-2"
                      >
                        Book / Directions
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Famous Foods & Local Cuisines */}
          {dest.famousFoods && dest.famousFoods.length > 0 && (
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
              <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
                <Utensils className="w-6 h-6 text-red-600" /> Famous Local Foods & Cuisines
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {dest.famousFoods.map((food, idx) => (
                  <div key={idx} className="flex border rounded-xl overflow-hidden bg-gray-50 p-3 gap-3 items-center">
                    {food.imageUrl && <img src={food.imageUrl} alt={food.dishName} className="w-20 h-20 object-cover rounded-lg flex-shrink-0" />}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-3 h-3 rounded-full border ${food.isVeg ? 'border-green-600 bg-green-500' : 'border-red-600 bg-red-500'}`} title={food.isVeg ? 'Vegetarian' : 'Non-Vegetarian'} />
                        <h4 className="font-bold text-gray-900 text-sm">{food.dishName}</h4>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">{food.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Smart Map */}
          <section className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-2xl font-bold mb-4">Smart Intelligence Map</h2>
            <div className="mb-4 flex flex-wrap gap-2">
              <span onClick={() => window.dispatchEvent(new CustomEvent('toggle-map-layer', {detail: 'places'}))} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold cursor-pointer hover:bg-blue-200">Tourist Places</span>
              <span onClick={() => window.dispatchEvent(new CustomEvent('toggle-map-layer', {detail: 'hotels'}))} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold cursor-pointer hover:bg-gray-200">Hotels (Demo)</span>
              <span onClick={() => window.dispatchEvent(new CustomEvent('toggle-map-layer', {detail: 'traffic'}))} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold cursor-pointer hover:bg-gray-200">Live Traffic</span>
            </div>
            <MapComponent center={dest.coordinates} title={dest.name} places={dest.places} />
          </section>
        </div>

        {/* RIGHT COLUMN - INTELLIGENCE PANELS */}
        <div className="space-y-6">
          
          {/* Weather & Sky */}
          {w && (
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg opacity-80 uppercase tracking-wider text-xs font-bold mb-1">Current Weather</h3>
                  <div className="text-4xl font-light">{Math.round(w.temp)}°C</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl mb-1">{w.skyCondition}</div>
                  <div className="text-sm opacity-90">{w.condition}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm bg-black/10 p-3 rounded-lg">
                <div>Rain Prob: <span className="font-bold">{w.rainProb}%</span></div>
                <div>Visibility: <span className="font-bold">{w.visibility}</span></div>
                <div>Humidity: <span className="font-bold">{w.humidity}%</span></div>
                <div>Wind: <span className="font-bold">{w.wind} m/s</span></div>
              </div>
              <div className="text-[10px] text-right mt-3 opacity-60">Source: {w.source || 'Weather API'}</div>
            </div>
          )}

          {/* Mountain Visibility - Rendered ONLY if destination is a mountain / hill region */}
          {w && (dest?.name + ' ' + dest?.description + ' ' + (dest?.bestAttractions || []).join(' ')).match(/mountain|hill|valley|ghat|peak|tirumala|araku|munnar|shimla|manali|ooty|horsley/i) && (
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-bold mb-3 flex items-center text-gray-800"><Mountain className="mr-2 text-indigo-600"/> Mountain View</h3>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold mb-3 ${
                w.mountainVisibility.includes('Excellent') ? 'bg-green-100 text-green-700' :
                w.mountainVisibility.includes('Partial') ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {w.mountainVisibility}
              </div>
              <p className="text-sm text-gray-600 mb-2"><span className="font-semibold text-gray-800">Expected View:</span> {w.expectedView}</p>
            </div>
          )}

          {/* Rain Impact */}
          {w && (
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-bold mb-3 flex items-center text-gray-800"><CloudRain className="mr-2 text-blue-400"/> Rain Impact</h3>
              <p className="text-sm text-gray-600 mb-1"><span className="font-semibold">Intensity:</span> {w.rainIntensity}</p>
              <p className="text-sm text-gray-600"><span className="font-semibold">Impact:</span> {w.rainProb > 50 ? 'Moderate - May affect outdoor travel and photography.' : 'Low - Minimal impact expected.'}</p>
            </div>
          )}

          {/* Traffic Intelligence */}
          {t && (
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-bold mb-3 flex items-center text-gray-800"><Car className="mr-2 text-gray-600"/> Traffic Status</h3>
              <div className="flex justify-between items-end mb-3">
                <span className="text-orange-600 font-bold text-lg">{t.currentTraffic}</span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">DEMO DATA</span>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <p>Estimated Now: <span className="font-semibold text-gray-800">{t.estimatedNow}</span></p>
                <p>Normal Journey: {t.normalJourney}</p>
                <p>Delay: <span className="text-red-500 font-semibold">+{t.delay}</span></p>
              </div>
            </div>
          )}

          {/* Crowd Intelligence */}
          {c && (
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-bold mb-3 flex items-center text-gray-800"><Users className="mr-2 text-purple-600"/> Crowd Level</h3>
              <div className="flex justify-between items-end mb-3">
                <span className="text-orange-600 font-bold text-lg">{c.currentCrowd}</span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">DEMO DATA</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">{c.expected}</p>
              <div className="grid grid-cols-4 gap-1 text-center text-xs">
                <div className="bg-green-50 p-1 rounded">Morn<br/>🟢</div>
                <div className="bg-yellow-50 p-1 rounded">Aft<br/>🟡</div>
                <div className="bg-orange-50 p-1 rounded">Eve<br/>🟠</div>
                <div className="bg-green-50 p-1 rounded">Ngt<br/>🟢</div>
              </div>
            </div>
          )}

          {/* Local Updates */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-bold mb-4 flex items-center text-gray-800"><AlertTriangle className="mr-2 text-red-500"/> Local Updates</h3>
            {observations.length === 0 ? (
              <p className="text-sm text-gray-500">No verified updates in the last 24h.</p>
            ) : (
              <div className="space-y-4">
                {observations.map(obs => (
                  <div key={obs._id} className="border-l-2 border-orange-400 pl-3 py-1">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-sm">{obs.category}</span>
                      <span className="text-[10px] bg-orange-100 text-orange-800 px-1 rounded">VERIFIED</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{obs.description}</p>
                    <p className="text-[10px] text-gray-400 mt-1 flex items-center">
                      <Clock className="w-3 h-3 mr-1"/> {new Date(obs.reportDate).toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default DestinationDetail;
