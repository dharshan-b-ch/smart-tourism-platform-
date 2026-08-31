import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import ImageCaptureUpload from '../../components/ImageCaptureUpload';
import { UserCheck, ShieldCheck, MapPin, Languages, Clock, AlertTriangle, Camera, Upload, CheckCircle2, Trash2, Loader2, Navigation, Compass } from 'lucide-react';

const GuideDashboard = () => {
  const { user } = useAuth();
  const [destinations, setDestinations] = useState([]);
  const [myPhotos, setMyPhotos] = useState([]);
  const [myGpsUpdates, setMyGpsUpdates] = useState([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [loadingGps, setLoadingGps] = useState(false);
  
  // Local Observation Form
  const [obsData, setObsData] = useState({
    destinationId: '',
    category: 'Road Condition',
    description: '',
    severity: 'Medium'
  });

  // Photo Upload Form
  const [photoData, setPhotoData] = useState({
    destinationId: '',
    imageUrl: '',
    caption: ''
  });

  // GPS Location Proof Form
  const [gpsData, setGpsData] = useState({
    imageUrl: '',
    placeName: '',
    latitude: null,
    longitude: null,
    destinationId: ''
  });
  const [capturingGps, setCapturingGps] = useState(false);
  const [gpsError, setGpsError] = useState(null);
  const [gpsMsg, setGpsMsg] = useState(null);

  const [obsMsg, setObsMsg] = useState(null);
  const [photoMsg, setPhotoMsg] = useState(null);

  const fetchMyData = async () => {
    setLoadingPhotos(true);
    setLoadingGps(true);
    try {
      const res = await api.get('/intelligence/photos/manage/my');
      setMyPhotos(res.data.data);
    } catch (err) {
      console.error("Error fetching my photos:", err);
    }
    setLoadingPhotos(false);

    try {
      const gpsRes = await api.get('/intelligence/guide-location-updates/my');
      setMyGpsUpdates(gpsRes.data.data);
    } catch (err) {
      console.error("Error fetching GPS updates:", err);
    }
    setLoadingGps(false);
  };

  useEffect(() => {
    api.get('/destinations').then(res => setDestinations(res.data.data)).catch(err => console.error(err));
    fetchMyData();
  }, []);

  // Capture GPS Location Function
  const handleCaptureGps = () => {
    setGpsError(null);
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setCapturingGps(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setGpsData(prev => ({ ...prev, latitude: lat, longitude: lng }));

        // Attempt Reverse Geocoding
        try {
          const geoRes = await api.get(`/services/reverse-geocode?lat=${lat}&lng=${lng}`);
          if (geoRes.data.data?.cityName) {
            setGpsData(prev => ({ ...prev, placeName: geoRes.data.data.cityName }));
          }
        } catch (e) {
          console.error("Reverse geocoding error:", e);
        }
        setCapturingGps(false);
      },
      (err) => {
        console.error("GPS error:", err);
        setCapturingGps(false);
        setGpsError('Location permission is required to attach GPS information to this update.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleGpsSubmit = async (e) => {
    e.preventDefault();
    setGpsError(null);
    setGpsMsg(null);

    if (!gpsData.imageUrl) {
      setGpsError('Please capture or select a photo first.');
      return;
    }

    if (gpsData.latitude === null || gpsData.longitude === null) {
      setGpsError('Location permission is required to attach GPS information to this update.');
      return;
    }

    try {
      await api.post('/intelligence/guide-location-update', gpsData);
      setGpsMsg('📸 GPS Photo Location Proof uploaded successfully with verified timestamp!');
      setGpsData({ imageUrl: '', placeName: '', latitude: null, longitude: null, destinationId: '' });
      fetchMyData();
    } catch (err) {
      setGpsError(err.response?.data?.message || 'Failed to submit GPS location proof.');
    }
  };

  const handleDeleteGpsUpdate = async (id) => {
    if (!window.confirm("Are you sure you want to delete this GPS Location Proof update?")) return;
    try {
      await api.delete(`/intelligence/guide-location-update/${id}`);
      fetchMyData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete update');
    }
  };

  const handleObsSubmit = async (e) => {
    e.preventDefault();
    setObsMsg(null);
    try {
      await api.post('/intelligence/observation', obsData);
      setObsMsg('Verified local update submitted to platform telemetry!');
      setObsData({ ...obsData, description: '' });
    } catch (err) { alert('Failed to submit update'); }
  };

  const handlePhotoSubmit = async (e) => {
    e.preventDefault();
    if (!photoData.imageUrl) {
      alert("Please capture a photo, select a file, or enter an image URL.");
      return;
    }
    setPhotoMsg(null);
    try {
      await api.post('/intelligence/photo', photoData);
      setPhotoMsg("Today's View photo uploaded successfully!");
      setPhotoData({ destinationId: '', imageUrl: '', caption: '' });
      fetchMyData();
    } catch (err) { alert('Failed to upload photo'); }
  };

  const handleDeletePhoto = async (photoId) => {
    if (!window.confirm("Are you sure you want to delete/discard this photo?")) return;
    try {
      await api.delete(`/intelligence/photo/${photoId}`);
      fetchMyData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete photo');
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16 animate-fade-in">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-green-800 via-green-700 to-teal-900 text-white p-8 rounded-3xl shadow-xl flex justify-between items-center flex-wrap gap-4">
        <div>
          <div className="flex items-center space-x-2 text-green-200 font-bold text-xs uppercase tracking-widest mb-2">
            <UserCheck className="w-5 h-5 text-green-300" /> Verified Local Guide Command
          </div>
          <h1 className="text-4xl font-extrabold">Guide Control Dashboard</h1>
          <p className="text-sm opacity-90 mt-1">Welcome back, {user?.name}! Post live updates and upload GPS Location Proofs.</p>
        </div>
        
        {/* Verification Status Badge */}
        <div className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md ${
          user?.status === 'APPROVED' ? 'bg-white text-green-800' : 'bg-yellow-400 text-yellow-900'
        }`}>
          <ShieldCheck className="w-4 h-4" /> Status: {user?.status}
        </div>
      </div>

      {user?.status !== 'APPROVED' && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-2xl text-yellow-800 text-sm space-y-2">
          <div className="font-bold text-base flex items-center gap-2">
            ⏳ Account Verification Pending
          </div>
          <p>Your guide application is currently being reviewed by platform administrators. Once approved, your services and local updates will be visible to tourists across India.</p>
        </div>
      )}

      {/* GUIDE PROFILE CARD */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-3">My Official Guide Profile</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-xl">
            <MapPin className="w-6 h-6 text-green-600 flex-shrink-0" />
            <div>
              <span className="text-xs text-gray-400 font-bold block uppercase">Service Area</span>
              <span className="font-bold text-gray-800">{user?.serviceLocation || 'Not specified'}</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-xl">
            <Languages className="w-6 h-6 text-blue-600 flex-shrink-0" />
            <div>
              <span className="text-xs text-gray-400 font-bold block uppercase">Languages</span>
              <span className="font-bold text-gray-800">{user?.languages?.join(', ') || 'English, Local'}</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-xl">
            <Clock className="w-6 h-6 text-purple-600 flex-shrink-0" />
            <div>
              <span className="text-xs text-gray-400 font-bold block uppercase">Experience</span>
              <span className="font-bold text-gray-800">{user?.experience || '3+ Years'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* FEATURE AREA 3: GPS LOCATION PHOTO PROOF UPLOAD */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-md border border-emerald-100 space-y-6">
        <div className="flex justify-between items-start flex-wrap gap-4 border-b pb-4">
          <div>
            <h3 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
              <Navigation className="w-6 h-6 text-emerald-600 transform rotate-45" /> 📸 Update Location Proof (GPS + Date/Time)
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Upload a live photo proof of your current location. GPS coordinates and server date/timestamp will be attached automatically.
            </p>
          </div>
          <button
            type="button"
            onClick={handleCaptureGps}
            disabled={capturingGps}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition flex items-center gap-1.5"
          >
            {capturingGps ? <Loader2 className="w-4 h-4 animate-spin" /> : <Compass className="w-4 h-4" />}
            {capturingGps ? 'Acquiring GPS...' : '📍 Acquire GPS Coordinates'}
          </button>
        </div>

        {gpsError && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-xl text-xs font-bold">
            ⚠️ {gpsError}
          </div>
        )}

        {gpsMsg && (
          <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 p-4 rounded-xl text-xs font-bold">
            {gpsMsg}
          </div>
        )}

        <form onSubmit={handleGpsSubmit} className="space-y-6 text-sm">
          {/* GPS Coordinates Telemetry Box */}
          <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-emerald-900">
            <div>
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Latitude</span>
              <span className="font-mono text-sm font-bold">{gpsData.latitude !== null ? gpsData.latitude.toFixed(6) : 'Not acquired yet'}</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Longitude</span>
              <span className="font-mono text-sm font-bold">{gpsData.longitude !== null ? gpsData.longitude.toFixed(6) : 'Not acquired yet'}</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Place / Location Name</span>
              <input
                type="text"
                className="w-full bg-white border rounded-lg p-1.5 text-xs text-gray-800 mt-0.5 outline-none"
                value={gpsData.placeName}
                onChange={e => setGpsData({ ...gpsData, placeName: e.target.value })}
                placeholder="e.g. Tirumala Hill Station"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-2">Location Photo Proof (Live Camera / File Upload)</label>
            <ImageCaptureUpload
              initialValue={gpsData.imageUrl}
              onImageReady={(img) => setGpsData(prev => ({ ...prev, imageUrl: img }))}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 rounded-xl transition shadow-lg text-base flex items-center justify-center gap-2"
          >
            <Upload className="w-5 h-5" /> Submit GPS Location Proof with Verified Timestamp
          </button>
        </form>
      </div>

      {/* MY GPS LOCATION PROOF UPDATES GALLERY */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
        <h3 className="text-xl font-bold text-gray-900 border-b pb-3 flex items-center justify-between">
          <span>My Verified GPS Location Proofs ({myGpsUpdates.length})</span>
          <span className="text-xs text-gray-400 font-normal">Stored with verified server timestamps & GPS data</span>
        </h3>

        {loadingGps ? (
          <div className="py-8 text-center text-gray-500"><Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-600 mb-1" /> Loading GPS updates...</div>
        ) : myGpsUpdates.length === 0 ? (
          <div className="bg-gray-50 text-gray-500 p-8 rounded-xl text-center text-sm">No GPS Location Proof updates submitted yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {myGpsUpdates.map(update => (
              <div key={update._id} className="bg-gray-50 border rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between group hover:shadow-md transition">
                <div className="relative h-48 bg-black">
                  <img src={update.imageUrl} alt={update.placeName || 'GPS Proof'} className="w-full h-full object-cover" />
                  <span className="absolute top-3 left-3 bg-emerald-600 text-white px-2.5 py-1 rounded-full text-[10px] font-extrabold">
                    📍 GPS VERIFIED
                  </span>
                  
                  <button
                    type="button"
                    onClick={() => handleDeleteGpsUpdate(update._id)}
                    className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 text-white p-2 rounded-xl shadow-lg transition"
                    title="Delete Update"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 space-y-1.5 text-xs">
                  <div className="font-extrabold text-gray-900 text-sm flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>{update.placeName || 'Verified Location'}</span>
                  </div>
                  
                  <div className="text-gray-500 space-y-0.5 text-[11px]">
                    <div><b>Date:</b> {new Date(update.timestamp || update.createdAt).toLocaleDateString()}</div>
                    <div><b>Time:</b> {new Date(update.timestamp || update.createdAt).toLocaleTimeString()}</div>
                    <div className="font-mono text-emerald-700"><b>GPS:</b> Lat {update.latitude.toFixed(4)}, Lng {update.longitude.toFixed(4)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* REPORTING & CAMERA UPLOAD TOOLS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Report Local Incident */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" /> Post Local Intelligence Update
          </h3>

          {obsMsg && <div className="bg-green-100 text-green-800 p-3 rounded-lg text-xs font-bold">{obsMsg}</div>}

          <form onSubmit={handleObsSubmit} className="space-y-4 text-sm">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Target Destination</label>
              <select required className="w-full p-3 border rounded-xl outline-none" value={obsData.destinationId} onChange={e => setObsData({...obsData, destinationId: e.target.value})}>
                <option value="">Select Destination...</option>
                {destinations.map(d => <option key={d._id} value={d._id}>{d.name} ({d.state})</option>)}
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Category</label>
              <select className="w-full p-3 border rounded-xl outline-none" value={obsData.category} onChange={e => setObsData({...obsData, category: e.target.value})}>
                <option>Road Condition</option>
                <option>Crowd Alert</option>
                <option>Weather & Rain Warning</option>
                <option>Mountain View Visibility</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Observation Description</label>
              <textarea required rows="3" className="w-full p-3 border rounded-xl outline-none text-xs" value={obsData.description} onChange={e => setObsData({...obsData, description: e.target.value})} placeholder="e.g. Heavy fog near ghat road. Drive slowly." />
            </div>

            <button type="submit" className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Publish Verified Alert
            </button>
          </form>
        </div>

        {/* Upload Today's View Photo */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-600" /> Upload Today's View Photo
          </h3>

          {photoMsg && <div className="bg-blue-100 text-blue-800 p-3 rounded-lg text-xs font-bold">{photoMsg}</div>}

          <form onSubmit={handlePhotoSubmit} className="space-y-4 text-sm">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Target Destination</label>
              <select required className="w-full p-3 border rounded-xl outline-none" value={photoData.destinationId} onChange={e => setPhotoData({...photoData, destinationId: e.target.value})}>
                <option value="">Select Destination...</option>
                {destinations.map(d => <option key={d._id} value={d._id}>{d.name} ({d.state})</option>)}
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-2">Photo Source (Live Camera / File Pick)</label>
              <ImageCaptureUpload
                initialValue={photoData.imageUrl}
                onImageReady={(img) => setPhotoData(prev => ({ ...prev, imageUrl: img }))}
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Caption / Description</label>
              <input type="text" className="w-full p-3 border rounded-xl outline-none" value={photoData.caption} onChange={e => setPhotoData({...photoData, caption: e.target.value})} placeholder="e.g. Clear blue skies at 9 AM today!" />
            </div>

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2">
              <Upload className="w-4 h-4" /> Upload Today's Scenic View
            </button>
          </form>
        </div>

      </div>

      {/* MY SCENIC UPLOADS GALLERY */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
        <h3 className="text-xl font-bold text-gray-900 border-b pb-3 flex items-center justify-between">
          <span>My Uploaded Scenic Views ({myPhotos.length})</span>
          <span className="text-xs text-gray-400 font-normal">Discard or delete photos anytime</span>
        </h3>

        {loadingPhotos ? (
          <div className="py-8 text-center text-gray-500"><Loader2 className="w-6 h-6 animate-spin mx-auto text-green-600 mb-1" /> Loading photos...</div>
        ) : myPhotos.length === 0 ? (
          <div className="bg-gray-50 text-gray-500 p-8 rounded-xl text-center text-sm">No photos uploaded yet. Snap a live photo or select a local file above!</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {myPhotos.map(photo => (
              <div key={photo._id} className="bg-gray-50 border rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between group hover:shadow-md transition">
                <div className="relative h-48 bg-black">
                  <img src={photo.imageUrl} alt={photo.description || 'Uploaded photo'} className="w-full h-full object-cover" />
                  <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                    photo.status === 'Verified' ? 'bg-green-600 text-white' : 'bg-yellow-500 text-white'
                  }`}>
                    {photo.status}
                  </span>
                  
                  <button
                    type="button"
                    onClick={() => handleDeletePhoto(photo._id)}
                    className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 text-white p-2 rounded-xl shadow-lg transition"
                    title="Delete / Discard Photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 space-y-2 text-xs">
                  <div className="font-bold text-gray-900 text-sm">
                    {photo.destinationId?.name || 'Destination'}
                  </div>
                  <p className="text-gray-600 line-clamp-2">{photo.description || photo.caption || 'No caption'}</p>
                  <p className="text-gray-400 text-[10px]">Uploaded: {new Date(photo.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default GuideDashboard;
