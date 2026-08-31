import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Compass, Map, CloudSun, Mountain, Car, Users, AlertTriangle, Camera, Heart, User, Hotel, Utensils, Bus, Ambulance, LogOut, Search, ArrowRight, ShieldCheck } from 'lucide-react';

const TouristDashboard = () => {
  const { user, logout } = useAuth();
  const [destinations, setDestinations] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/destinations').then(res => setDestinations(res.data.data)).catch(err => console.error(err));
  }, []);

  const filteredDestinations = destinations.filter(d => d.name.toLowerCase().includes(search.toLowerCase()) || d.state.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-16 animate-fade-in">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white p-8 rounded-3xl shadow-xl flex justify-between items-center flex-wrap gap-4">
        <div>
          <div className="flex items-center space-x-2 text-blue-200 font-bold text-xs uppercase tracking-widest mb-2">
            <Compass className="w-5 h-5 text-blue-300" /> Smart Digital Travel Companion
          </div>
          <h1 className="text-4xl font-extrabold">Welcome, {user?.name || 'Tourist'}!</h1>
          <p className="text-sm opacity-90 mt-1">Explore destinations, generate AI trip itineraries, and track live conditions across India.</p>
        </div>
        <button onClick={logout} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border border-white/20 transition">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>

      {/* QUICK INTELLIGENCE TOOLBAR */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Link to="/planner" className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition text-center group">
          <div className="bg-blue-50 text-blue-600 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
            <Compass className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold text-gray-800 block">🤖 AI Planner</span>
        </Link>

        <Link to="/destinations" className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition text-center group">
          <div className="bg-indigo-50 text-indigo-600 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
            <Map className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold text-gray-800 block">📍 Live Map</span>
        </Link>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
          <div className="bg-sky-50 text-sky-600 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2">
            <CloudSun className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold text-gray-800 block">🌦️ Weather</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
          <div className="bg-purple-50 text-purple-600 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2">
            <Mountain className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold text-gray-800 block">🏔️ Visibility</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
          <div className="bg-orange-50 text-orange-600 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2">
            <Car className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold text-gray-800 block">🚗 Traffic</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
          <div className="bg-green-50 text-green-600 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold text-gray-800 block">⚠️ Safety Risk</span>
        </div>
      </div>

      {/* DESTINATION DISCOVERY SEARCH */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Discover Destinations</h3>
            <p className="text-xs text-gray-500">Select any location to access live satellite maps, today's photos, and visibility scores.</p>
          </div>
          
          <div className="flex items-center bg-gray-50 border px-4 py-2 rounded-xl w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input 
              type="text" 
              className="bg-transparent text-sm outline-none w-full"
              placeholder="Search destination or state..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDestinations.map(dest => (
            <div key={dest._id} className="bg-gray-50 border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between">
              <div className="relative h-48 overflow-hidden">
                <img src={dest.imageUrl} alt={dest.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-full font-bold">
                  {dest.state}
                </div>
              </div>
              <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{dest.name}</h4>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{dest.description}</p>
                </div>
                <Link to={`/destinations/${dest._id}`} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 rounded-xl transition text-center flex items-center justify-center gap-1">
                  View Intelligence Dashboard <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default TouristDashboard;
