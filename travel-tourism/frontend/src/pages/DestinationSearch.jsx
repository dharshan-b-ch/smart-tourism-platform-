import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Search, MapPin, Loader2, Navigation } from 'lucide-react';

const DestinationSearch = () => {
  const [searchParams] = useSearchParams();
  const [destinations, setDestinations] = useState([]);
  const [query, setQuery] = useState(searchParams.get('query') || '');
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const q = searchParams.get('query') || '';
    setQuery(q);
    fetchDestinations(q);
  }, [searchParams]);

  const fetchDestinations = async (searchQuery) => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = searchQuery ? `/destinations?search=${searchQuery}` : '/destinations';
      const res = await api.get(endpoint);
      setDestinations(res.data.data);
    } catch (err) {
      setError('Failed to fetch destinations');
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDestinations(query);
  };

  const handleUseLiveLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        try {
          const res = await api.get(`/services/reverse-geocode?lat=${lat}&lng=${lng}`);
          const city = res.data.data?.cityName || 'Tirupati';
          setQuery(city);
          navigate(`/destinations?query=${city}`);
        } catch (err) {
          setQuery('Tirupati');
          navigate(`/destinations?query=Tirupati`);
        }
        setLocating(false);
      },
      (err) => {
        alert('Could not detect live location: ' + err.message);
        setLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto pb-16">
      
      {/* Search Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-black text-white p-8 rounded-3xl shadow-xl space-y-4">
        <h1 className="text-4xl font-extrabold">Explore Indian Destinations</h1>
        <p className="text-gray-300 text-sm max-w-xl">
          Search sacred temples, hill stations, heritage forts, and natural wonders across Indian states with realistic landmark imagery.
        </p>

        {/* Search Bar with Live Location Arrow */}
        <form onSubmit={handleSearch} className="flex items-center bg-white rounded-2xl p-2 max-w-xl text-gray-900 shadow-md">
          <Search className="w-5 h-5 text-gray-400 ml-3 mr-2 flex-shrink-0" />
          <input
            type="text"
            className="w-full bg-transparent border-none outline-none text-sm font-medium"
            placeholder="Search by city, landmark, or state (e.g. Araku, Tirupati, Kedarnath)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          
          <button
            type="button"
            onClick={handleUseLiveLocation}
            disabled={locating}
            className="p-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition flex items-center justify-center mr-1 flex-shrink-0 border border-blue-200"
            title="Locate My Position (Live Location Arrow)"
          >
            {locating ? <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> : <Navigation className="w-4 h-4 transform rotate-45 text-blue-600" />}
          </button>

          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex-shrink-0">
            Search
          </button>
        </form>
      </div>

      {loading && (
        <div className="flex justify-center my-20">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
        </div>
      )}

      {error && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-xl text-sm font-medium">{error}</div>}

      {!loading && destinations.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center text-gray-500 border border-gray-100">
          No destinations found matching your search. Click the location arrow or try searching another city.
        </div>
      )}

      {/* Destination Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {destinations.map(dest => (
          <div key={dest._id} className="bg-white rounded-3xl shadow-md overflow-hidden hover:shadow-xl transition-all group flex flex-col justify-between border border-gray-100">
            <div className="relative h-52 overflow-hidden bg-gray-900">
              <img 
                src={dest.imageUrl} 
                alt={dest.name} 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1506461883276-594a12b11cb3?q=80&w=800';
                }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
              />
              <span className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full font-bold">
                {dest.state}
              </span>
            </div>
            
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-1">{dest.name}</h3>
                <p className="text-gray-500 text-xs font-semibold flex items-center mb-3">
                  <MapPin className="w-4 h-4 mr-1 text-blue-600" /> {dest.location}, {dest.state}
                </p>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{dest.description}</p>
              </div>

              <Link to={`/destinations/${dest._id}`} className="block text-center w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow-md text-sm">
                View Details & Map
              </Link>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default DestinationSearch;
