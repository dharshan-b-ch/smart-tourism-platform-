import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Map, CloudSun, ShieldCheck, Compass, ArrowRight, UserCheck, ShieldAlert, LogIn, UserPlus, Navigation, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const LandingPage = () => {
  const [search, setSearch] = useState('');
  const [locating, setLocating] = useState(false);
  const [activeTab, setActiveTab] = useState('tourist'); // 'tourist' | 'admin'
  const [isRegister, setIsRegister] = useState(false);
  
  // Auth Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('tourist');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { user, login, register: registerUser } = useAuth();

  const handleSearch = (e) => {
    e.preventDefault();
    if (search) navigate(`/destinations?query=${search}`);
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
          setSearch(city);
          navigate(`/destinations?query=${city}`);
        } catch (err) {
          setSearch('Tirupati');
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

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isRegister) {
        await registerUser({ name, email, password, role: activeTab === 'admin' ? role : 'tourist' });
      } else {
        await login(email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Check credentials.');
    }
    setLoading(false);
  };

  const fillQuickDemo = (demoEmail, demoRole) => {
    setEmail(demoEmail);
    setPassword('password123');
    setIsRegister(false);
    if (demoRole) setRole(demoRole);
  };

  return (
    <div className="-mt-8 animate-fade-in space-y-16">
      
      {/* 1. HERO & INTRODUCTION SECTION */}
      <div className="relative bg-gradient-to-r from-blue-900 via-indigo-900 to-black text-white py-20 px-4 min-h-[70vh] flex flex-col justify-center items-center rounded-b-3xl overflow-hidden shadow-2xl">
        <img 
          src="https://images.unsplash.com/photo-1506461883276-594a12b11cb3?q=80&w=2000&auto=format&fit=crop" 
          alt="Tourism Landscape" 
          className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay"
        />
        
        <div className="relative z-10 text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-block bg-blue-600/80 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-sm font-bold tracking-wider border border-blue-400/30">
            SMART TOURISM INTELLIGENCE PLATFORM
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
            Explore Smarter. <span className="text-blue-400">Travel Safer.</span> Experience More.
          </h1>
          
          <p className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
            Welcome to the AI Smart Tourism Platform! Your interactive companion to explore famous Indian temples, scenic mountains, check live traffic, verify weather visibility, and get AI-powered itineraries.
          </p>
          
          {/* Quick Destination Search with Live Location Arrow Button */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex bg-white/10 backdrop-blur-md border border-white/30 p-2 rounded-full overflow-hidden shadow-2xl focus-within:ring-2 ring-blue-400 transition-all items-center">
            <div className="flex-grow flex items-center pl-4">
              <Search className="w-6 h-6 text-white/70 flex-shrink-0" />
              <input 
                type="text" 
                className="w-full p-3 bg-transparent outline-none text-white placeholder-white/70 text-base font-medium"
                placeholder="Search any location (e.g., Tirupati, Araku Valley, Delhi)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* LIVE LOCATION ARROW MARK BUTTON */}
            <button
              type="button"
              onClick={handleUseLiveLocation}
              disabled={locating}
              className="p-3 bg-white/20 hover:bg-white/30 text-white rounded-full transition flex items-center justify-center mr-2 border border-white/30 flex-shrink-0"
              title="Use My Live Location (Arrow Mark)"
            >
              {locating ? <Loader2 className="w-5 h-5 animate-spin text-yellow-300" /> : <Navigation className="w-5 h-5 text-emerald-300 transform rotate-45" />}
            </button>

            <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-full font-bold transition-colors flex items-center shadow-lg flex-shrink-0">
              Explore <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </form>
        </div>
      </div>

      {/* 2. AUTHENTICATION & REGISTRATION PORTAL */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          
          {/* Role Header Tabs */}
          <div className="flex border-b">
            <button 
              onClick={() => { setActiveTab('tourist'); setError(null); }}
              className={`flex-1 py-4 font-bold text-lg flex items-center justify-center gap-2 transition-colors ${activeTab === 'tourist' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
            >
              <UserCheck className="w-5 h-5" /> Tourist Portal
            </button>
            <button 
              onClick={() => { setActiveTab('admin'); setError(null); }}
              className={`flex-1 py-4 font-bold text-lg flex items-center justify-center gap-2 transition-colors ${activeTab === 'admin' ? 'bg-indigo-900 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
            >
              <ShieldAlert className="w-5 h-5" /> Admin / Staff Portal
            </button>
          </div>

          <div className="p-8">
            {user ? (
              <div className="text-center py-6 space-y-4">
                <div className="text-2xl font-bold text-gray-800">Welcome back, {user.name}!</div>
                <p className="text-gray-600">You are logged in as <span className="font-bold text-blue-600 uppercase">{user.role}</span>.</p>
                <button onClick={() => navigate('/dashboard')} className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition">
                  Go to My Dashboard
                </button>
              </div>
            ) : (
              <div className="max-w-md mx-auto space-y-6">
                
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {activeTab === 'tourist' ? 'Tourist Access' : 'Admin & Staff Management'}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {isRegister ? 'Create a new account to get started' : 'Sign in to access your customized dashboard'}
                  </p>
                </div>

                {/* Quick Auto-Fill Demo Credentials */}
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-xs space-y-2">
                  <span className="font-bold text-blue-800 block">⚡ Quick Demo One-Click Login:</span>
                  {activeTab === 'tourist' ? (
                    <button type="button" onClick={() => fillQuickDemo('tourist@test.com')} className="w-full text-left bg-white p-2 rounded border hover:bg-blue-100 font-medium text-blue-700">
                      🔑 Login as Demo Tourist (tourist@test.com)
                    </button>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button type="button" onClick={() => fillQuickDemo('admin@test.com', 'admin')} className="text-left bg-white p-2 rounded border hover:bg-blue-100 font-medium text-indigo-700">
                        🛡️ Admin
                      </button>
                      <button type="button" onClick={() => fillQuickDemo('guide@test.com', 'guide')} className="text-left bg-white p-2 rounded border hover:bg-blue-100 font-medium text-green-700">
                        🚩 Guide
                      </button>
                      <button type="button" onClick={() => fillQuickDemo('photo@test.com', 'photographer')} className="text-left bg-white p-2 rounded border hover:bg-blue-100 font-medium text-purple-700">
                        📸 Photo
                      </button>
                    </div>
                  )}
                </div>

                {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm text-center font-medium">{error}</div>}

                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  {isRegister && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input required type="text" className="w-full p-3 border rounded-lg focus:ring-2 ring-blue-500 outline-none" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Ramesh Kumar" />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input required type="email" className="w-full p-3 border rounded-lg focus:ring-2 ring-blue-500 outline-none" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input required type="password" className="w-full p-3 border rounded-lg focus:ring-2 ring-blue-500 outline-none" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
                  </div>

                  {isRegister && activeTab === 'admin' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Register Role</label>
                      <select className="w-full p-3 border rounded-lg focus:ring-2 ring-blue-500 outline-none" value={role} onChange={e => setRole(e.target.value)}>
                        <option value="admin">Platform Admin</option>
                        <option value="guide">Verified Local Guide</option>
                        <option value="photographer">Verified Photographer</option>
                      </select>
                    </div>
                  )}

                  <button type="submit" disabled={loading} className={`w-full py-3.5 rounded-lg font-bold text-white transition flex items-center justify-center gap-2 ${activeTab === 'tourist' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-indigo-900 hover:bg-indigo-800'}`}>
                    {isRegister ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
                    {isRegister ? `Register as ${activeTab === 'admin' ? role.toUpperCase() : 'TOURIST'}` : `Sign In as ${activeTab === 'admin' ? 'STAFF / ADMIN' : 'TOURIST'}`}
                  </button>
                </form>

                <div className="text-center text-sm text-gray-600 pt-2">
                  {isRegister ? "Already have an account?" : "Need a new account?"}{" "}
                  <button type="button" onClick={() => { setIsRegister(!isRegister); setError(null); }} className="font-bold text-blue-600 hover:underline">
                    {isRegister ? "Sign In Here" : "Register Here"}
                  </button>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. PLATFORM FEATURES & ABOUT SECTION */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Key Platform Capabilities</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Designed for SIH26202 to solve real tourism challenges across India.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition">
            <Compass className="w-10 h-10 text-blue-600 mb-4" />
            <h3 className="text-lg font-bold mb-2">AI Smart Itineraries</h3>
            <p className="text-sm text-gray-600">Generates custom 1-to-14 day plans taking famous local temples, mountains, and weather into account.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition">
            <Map className="w-10 h-10 text-indigo-600 mb-4" />
            <h3 className="text-lg font-bold mb-2">Live Google Satellite Map</h3>
            <p className="text-sm text-gray-600">Interactive satellite maps with live location tracking, hotel popups, and real-time traffic overlays.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition">
            <CloudSun className="w-10 h-10 text-sky-600 mb-4" />
            <h3 className="text-lg font-bold mb-2">Mountain Visibility</h3>
            <p className="text-sm text-gray-600">Checks rain probability and sky clarity so tourists know if mountain viewpoints are clear.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition">
            <ShieldCheck className="w-10 h-10 text-green-600 mb-4" />
            <h3 className="text-lg font-bold mb-2">Verified Today's View</h3>
            <p className="text-sm text-gray-600">Guides & Photographers upload timestamped live photos and local incident warnings.</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default LandingPage;
