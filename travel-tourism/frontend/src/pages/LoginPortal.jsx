import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { ShieldCheck, UserCheck, Camera, Compass, ArrowLeft, LogIn, UserPlus, AlertCircle } from 'lucide-react';

const LoginPortal = () => {
  const [selectedRole, setSelectedRole] = useState(null); // 'ADMIN' | 'GUIDE' | 'TOURIST' | 'PHOTOGRAPHER'
  const [isRegister, setIsRegister] = useState(false);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [serviceLocation, setServiceLocation] = useState('');
  const [languages, setLanguages] = useState('');
  const [photographyType, setPhotographyType] = useState('Landscape & Nature');
  const [experience, setExperience] = useState('1-3 Years');
  const [description, setDescription] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('English');

  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setIsRegister(false);
    setError(null);
    setSuccessMsg(null);
    setEmail('');
    setPassword('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);
    try {
      const userData = await login(email, password, selectedRole);
      // Redirect to specific role dashboard
      const rolePath = userData.role.toLowerCase();
      navigate(`/${rolePath}/dashboard`);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    }
    setLoading(false);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      let endpoint = '/auth/register/tourist';
      let payload = { name, email, password, phone, preferredLanguage };

      if (selectedRole === 'GUIDE') {
        endpoint = '/auth/register/guide';
        payload = { name, email, password, phone, serviceLocation, languages, experience, description };
      } else if (selectedRole === 'PHOTOGRAPHER') {
        endpoint = '/auth/register/photographer';
        payload = { name, email, password, phone, serviceLocation, photographyType, experience, description };
      } else if (selectedRole === 'ADMIN') {
        endpoint = '/auth/register/admin';
        payload = { name, email, password, phone, description };
      }

      const res = await api.post(endpoint, payload);
      const data = res.data;

      if (data && data.success === false) {
        throw new Error(data.message || 'Registration failed');
      }

      if (selectedRole === 'TOURIST') {
        setSuccessMsg(data.message || '✅ Tourist registration successful!');
        await login(email, password, 'TOURIST');
        setTimeout(() => {
          navigate('/tourist/dashboard');
        }, 1500);
      } else {
        // Pending approval message for Guide, Photographer & Admin (GREEN)
        setSuccessMsg(data.message || 'Registration submitted! Status is PENDING until approved by an existing administrator.');
        setIsRegister(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed. Please try again.');
    }
    setLoading(false);
  };

  const fillDemo = (demoEmail, demoPass = 'password123') => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setIsRegister(false);
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 animate-fade-in">
      
      {/* Header Banner */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-3">
          Welcome to Smart Tourism
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Explore Smarter. Travel Safer. Experience More.
        </p>
      </div>

      {/* STEP 1: ROLE SELECTION CARDS */}
      {!selectedRole && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Admin Card */}
          <div 
            className="bg-white p-6 rounded-2xl border-2 border-indigo-100 hover:border-indigo-600 shadow-md hover:shadow-2xl transition-all group text-center flex flex-col justify-between"
          >
            <div>
              <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">👨‍💼</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">Admin</h3>
              <p className="text-xs text-indigo-600 font-semibold uppercase tracking-wider mb-3">Manage Platform</p>
              <p className="text-xs text-gray-500 mb-6">Access platform telemetry, review user verifications, and approve pending accounts.</p>
            </div>
            <div className="space-y-2">
              <button onClick={() => { handleRoleSelect('ADMIN'); setIsRegister(false); }} className="w-full bg-indigo-900 text-white py-2 rounded-xl font-bold hover:bg-indigo-800 transition text-sm">
                Admin Login
              </button>
              <button onClick={() => { handleRoleSelect('ADMIN'); setIsRegister(true); }} className="w-full bg-indigo-50 text-indigo-700 border border-indigo-200 py-2 rounded-xl font-bold hover:bg-indigo-100 transition text-sm">
                Register Admin
              </button>
            </div>
          </div>

          {/* Guide Card */}
          <div 
            className="bg-white p-6 rounded-2xl border-2 border-green-100 hover:border-green-600 shadow-md hover:shadow-2xl transition-all group text-center flex flex-col justify-between"
          >
            <div>
              <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">🧑‍🏫</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">Local Guide</h3>
              <p className="text-xs text-green-600 font-semibold uppercase tracking-wider mb-3">Help Tourists</p>
              <p className="text-xs text-gray-500 mb-6">Provide verified local updates, lead guided tours, and assist traveling families.</p>
            </div>
            <div className="space-y-2">
              <button onClick={() => { handleRoleSelect('GUIDE'); setIsRegister(false); }} className="w-full bg-green-600 text-white py-2 rounded-xl font-bold hover:bg-green-700 transition text-sm">
                Guide Login
              </button>
              <button onClick={() => { handleRoleSelect('GUIDE'); setIsRegister(true); }} className="w-full bg-green-50 text-green-700 border border-green-200 py-2 rounded-xl font-bold hover:bg-green-100 transition text-sm">
                Register as Guide
              </button>
            </div>
          </div>

          {/* Tourist Card */}
          <div 
            className="bg-white p-6 rounded-2xl border-2 border-blue-100 hover:border-blue-600 shadow-md hover:shadow-2xl transition-all group text-center flex flex-col justify-between"
          >
            <div>
              <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">🧳</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">Tourist</h3>
              <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-3">Explore & Travel</p>
              <p className="text-xs text-gray-500 mb-6">Plan AI trips, view live satellite maps, check weather visibility, and travel safely.</p>
            </div>
            <div className="space-y-2">
              <button onClick={() => { handleRoleSelect('TOURIST'); setIsRegister(false); }} className="w-full bg-blue-600 text-white py-2 rounded-xl font-bold hover:bg-blue-700 transition text-sm">
                Tourist Login
              </button>
              <button onClick={() => { handleRoleSelect('TOURIST'); setIsRegister(true); }} className="w-full bg-blue-50 text-blue-700 border border-blue-200 py-2 rounded-xl font-bold hover:bg-blue-100 transition text-sm">
                Register Tourist
              </button>
            </div>
          </div>

          {/* Photographer Card */}
          <div 
            className="bg-white p-6 rounded-2xl border-2 border-purple-100 hover:border-purple-600 shadow-md hover:shadow-2xl transition-all group text-center flex flex-col justify-between"
          >
            <div>
              <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">📸</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">Photographer</h3>
              <p className="text-xs text-purple-600 font-semibold uppercase tracking-wider mb-3">Capture Experiences</p>
              <p className="text-xs text-gray-500 mb-6">Upload timestamped live scenic photos and share today's mountain visibility.</p>
            </div>
            <div className="space-y-2">
              <button onClick={() => { handleRoleSelect('PHOTOGRAPHER'); setIsRegister(false); }} className="w-full bg-purple-600 text-white py-2 rounded-xl font-bold hover:bg-purple-700 transition text-sm">
                Photographer Login
              </button>
              <button onClick={() => { handleRoleSelect('PHOTOGRAPHER'); setIsRegister(true); }} className="w-full bg-purple-50 text-purple-700 border border-purple-200 py-2 rounded-xl font-bold hover:bg-purple-100 transition text-sm">
                Register Photographer
              </button>
            </div>
          </div>

        </div>
      )}

      {/* STEP 2: DEDICATED LOGIN / REGISTRATION FORM */}
      {selectedRole && (
        <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 relative animate-fade-in">
          
          <button 
            onClick={() => setSelectedRole(null)}
            className="flex items-center text-sm font-bold text-gray-500 hover:text-gray-900 mb-6 transition"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Role Selection
          </button>

          {/* Role Title Badge */}
          <div className="text-center mb-8">
            <div className="text-4xl mb-2">
              {selectedRole === 'ADMIN' && '👨‍💼'}
              {selectedRole === 'GUIDE' && '🧑‍🏫'}
              {selectedRole === 'TOURIST' && '🧳'}
              {selectedRole === 'PHOTOGRAPHER' && '📸'}
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900">
              {selectedRole} {isRegister ? 'REGISTRATION' : 'LOGIN'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {selectedRole === 'ADMIN' && 'Sign in or apply as a platform administrator candidate.'}
              {selectedRole === 'GUIDE' && 'Sign in or apply to become a verified local guide.'}
              {selectedRole === 'TOURIST' && 'Access your personalized smart travel dashboard.'}
              {selectedRole === 'PHOTOGRAPHER' && 'Sign in to share live scenic photography.'}
            </p>

            {/* Login / Register Toggle Tabs */}
            <div className="flex bg-gray-100 p-1 rounded-xl max-w-xs mx-auto mt-4 text-xs font-bold">
              <button 
                type="button" 
                onClick={() => { setIsRegister(false); setError(null); }}
                className={`flex-1 py-2 rounded-lg transition ${!isRegister ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
              >
                Login
              </button>
              <button 
                type="button" 
                onClick={() => { setIsRegister(true); setError(null); }}
                className={`flex-1 py-2 rounded-lg transition ${isRegister ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
              >
                Register Account
              </button>
            </div>
          </div>

          {/* Demo Quick-Fill Bar */}
          {!isRegister && (
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs mb-6 flex justify-between items-center">
              <span className="font-semibold text-gray-600">⚡ Demo Credential:</span>
              {selectedRole === 'ADMIN' && (
                <button type="button" onClick={() => fillDemo('admin@test.com')} className="text-indigo-600 font-bold hover:underline">
                  Fill Primary Admin (admin@test.com)
                </button>
              )}
              {selectedRole === 'GUIDE' && (
                <button type="button" onClick={() => fillDemo('guide@test.com')} className="text-green-600 font-bold hover:underline">
                  Fill Approved Guide (guide@test.com)
                </button>
              )}
              {selectedRole === 'TOURIST' && (
                <button type="button" onClick={() => fillDemo('tourist@test.com')} className="text-blue-600 font-bold hover:underline">
                  Fill Tourist (tourist@test.com)
                </button>
              )}
              {selectedRole === 'PHOTOGRAPHER' && (
                <button type="button" onClick={() => fillDemo('photo@test.com')} className="text-purple-600 font-bold hover:underline">
                  Fill Photographer (photo@test.com)
                </button>
              )}
            </div>
          )}

          {/* Status Notifications */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-2xl mb-6 text-xs font-bold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-800 p-4 rounded-2xl mb-6 text-xs font-bold flex items-center space-x-2">
              <UserCheck className="w-4 h-4 flex-shrink-0 text-green-700" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {!isRegister ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Email Address</label>
                <input 
                  required 
                  type="email" 
                  className="w-full p-3.5 border rounded-xl outline-none focus:ring-2 ring-blue-400 bg-gray-50 focus:bg-white" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. user@test.com"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Password</label>
                <input 
                  required 
                  type="password" 
                  className="w-full p-3.5 border rounded-xl outline-none focus:ring-2 ring-blue-400 bg-gray-50 focus:bg-white" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className={`w-full text-white font-bold py-3.5 rounded-xl transition shadow-lg text-base flex items-center justify-center space-x-2 ${
                  selectedRole === 'ADMIN' ? 'bg-indigo-900 hover:bg-indigo-800' :
                  selectedRole === 'GUIDE' ? 'bg-green-700 hover:bg-green-800' :
                  selectedRole === 'PHOTOGRAPHER' ? 'bg-purple-700 hover:bg-purple-800' :
                  'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                <LogIn className="w-5 h-5" />
                <span>{loading ? 'Authenticating...' : `Log In as ${selectedRole}`}</span>
              </button>
            </form>
          ) : (
            
            /* REGISTRATION FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Full Name</label>
                <input 
                  required 
                  type="text" 
                  className="w-full p-3 border rounded-xl outline-none focus:ring-2 ring-blue-400" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Email Address</label>
                <input 
                  required 
                  type="email" 
                  className="w-full p-3 border rounded-xl outline-none focus:ring-2 ring-blue-400" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. ramesh@example.com"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Password</label>
                  <input 
                    required 
                    type="password" 
                    className="w-full p-3 border rounded-xl outline-none focus:ring-2 ring-blue-400" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Confirm Password</label>
                  <input 
                    required 
                    type="password" 
                    className="w-full p-3 border rounded-xl outline-none focus:ring-2 ring-blue-400" 
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Phone Number</label>
                <input 
                  required 
                  type="text" 
                  className="w-full p-3 border rounded-xl outline-none focus:ring-2 ring-blue-400" 
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                />
              </div>

              {/* ROLE SPECIFIC REGISTRATION FIELDS */}
              {selectedRole === 'ADMIN' && (
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Department / Organization Notes</label>
                  <input 
                    type="text" 
                    className="w-full p-3 border rounded-xl outline-none focus:ring-2 ring-blue-400" 
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="e.g. Tourism Department Administration"
                  />
                </div>
              )}

              {selectedRole === 'GUIDE' && (
                <>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Service Location / City</label>
                    <input 
                      required 
                      type="text" 
                      className="w-full p-3 border rounded-xl outline-none focus:ring-2 ring-blue-400" 
                      value={serviceLocation}
                      onChange={e => setServiceLocation(e.target.value)}
                      placeholder="e.g. Araku Valley, Visakhapatnam"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Languages Spoken (Comma separated)</label>
                    <input 
                      required 
                      type="text" 
                      className="w-full p-3 border rounded-xl outline-none focus:ring-2 ring-blue-400" 
                      value={languages}
                      onChange={e => setLanguages(e.target.value)}
                      placeholder="e.g. Telugu, English, Hindi"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Experience Level</label>
                    <select 
                      className="w-full p-3 border rounded-xl outline-none focus:ring-2 ring-blue-400"
                      value={experience}
                      onChange={e => setExperience(e.target.value)}
                    >
                      <option>1-3 Years</option>
                      <option>3-5 Years</option>
                      <option>5+ Years Certified</option>
                    </select>
                  </div>
                </>
              )}

              {selectedRole === 'PHOTOGRAPHER' && (
                <>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Service Location / City</label>
                    <input 
                      required 
                      type="text" 
                      className="w-full p-3 border rounded-xl outline-none focus:ring-2 ring-blue-400" 
                      value={serviceLocation}
                      onChange={e => setServiceLocation(e.target.value)}
                      placeholder="e.g. Tirupati, Chittoor"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Photography Specialty</label>
                    <select 
                      className="w-full p-3 border rounded-xl outline-none focus:ring-2 ring-blue-400"
                      value={photographyType}
                      onChange={e => setPhotographyType(e.target.value)}
                    >
                      <option>Landscape & Nature</option>
                      <option>Portrait & Tourist Photography</option>
                      <option>Cultural Events & Temple Heritage</option>
                    </select>
                  </div>
                </>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className={`w-full text-white font-bold py-3.5 rounded-xl transition shadow-lg text-base flex items-center justify-center space-x-2 ${
                  selectedRole === 'ADMIN' ? 'bg-indigo-900 hover:bg-indigo-800' :
                  selectedRole === 'GUIDE' ? 'bg-green-700 hover:bg-green-800' :
                  selectedRole === 'PHOTOGRAPHER' ? 'bg-purple-700 hover:bg-purple-800' :
                  'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                <UserPlus className="w-5 h-5" />
                <span>{loading ? 'Submitting...' : `Register as ${selectedRole}`}</span>
              </button>
            </form>
          )}

        </div>
      )}

    </div>
  );
};

export default LoginPortal;
