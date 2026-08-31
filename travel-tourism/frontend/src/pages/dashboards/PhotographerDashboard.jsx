import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import ImageCaptureUpload from '../../components/ImageCaptureUpload';
import { Camera, ShieldCheck, MapPin, Upload, Image as ImageIcon, CheckCircle2, Trash2, Loader2 } from 'lucide-react';

const PhotographerDashboard = () => {
  const { user } = useAuth();
  const [destinations, setDestinations] = useState([]);
  const [myPhotos, setMyPhotos] = useState([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  
  // Photo Upload Form
  const [photoData, setPhotoData] = useState({
    destinationId: '',
    imageUrl: '',
    caption: ''
  });

  const [photoMsg, setPhotoMsg] = useState(null);

  const fetchMyPhotos = async () => {
    setLoadingPhotos(true);
    try {
      const res = await api.get('/intelligence/photos/manage/my');
      setMyPhotos(res.data.data);
    } catch (err) {
      console.error("Error fetching my photos:", err);
    }
    setLoadingPhotos(false);
  };

  useEffect(() => {
    api.get('/destinations').then(res => setDestinations(res.data.data)).catch(err => console.error(err));
    fetchMyPhotos();
  }, []);

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
      fetchMyPhotos();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload photo');
    }
  };

  const handleDeletePhoto = async (photoId) => {
    if (!window.confirm("Are you sure you want to delete/discard this photo?")) return;
    try {
      await api.delete(`/intelligence/photo/${photoId}`);
      fetchMyPhotos();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete photo');
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16 animate-fade-in">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 text-white p-8 rounded-3xl shadow-xl flex justify-between items-center flex-wrap gap-4">
        <div>
          <div className="flex items-center space-x-2 text-purple-200 font-bold text-xs uppercase tracking-widest mb-2">
            <Camera className="w-5 h-5 text-purple-300" /> Official Photographer Portal
          </div>
          <h1 className="text-4xl font-extrabold">Photographer Studio Dashboard</h1>
          <p className="text-sm opacity-90 mt-1">Welcome back, {user?.name}! Share live scenery and showcase your portfolio.</p>
        </div>
        
        {/* Verification Status Badge */}
        <div className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md ${
          user?.status === 'APPROVED' ? 'bg-white text-purple-900' : 'bg-yellow-400 text-yellow-900'
        }`}>
          <ShieldCheck className="w-4 h-4" /> Status: {user?.status}
        </div>
      </div>

      {user?.status !== 'APPROVED' && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-2xl text-yellow-800 text-sm space-y-2">
          <div className="font-bold text-base flex items-center gap-2">
            ⏳ Account Verification Pending
          </div>
          <p>Your photographer application is currently under admin review. Once verified, your live photo uploads will display with an official verified badge across all destination dashboards.</p>
        </div>
      )}

      {/* PHOTOGRAPHER PROFILE CARD */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-3">My Photographer Profile</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-xl">
            <MapPin className="w-6 h-6 text-purple-600 flex-shrink-0" />
            <div>
              <span className="text-xs text-gray-400 font-bold block uppercase">Service Location</span>
              <span className="font-bold text-gray-800">{user?.serviceLocation || 'Not specified'}</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-xl">
            <Camera className="w-6 h-6 text-blue-600 flex-shrink-0" />
            <div>
              <span className="text-xs text-gray-400 font-bold block uppercase">Specialization</span>
              <span className="font-bold text-gray-800">{user?.photographyType || 'Landscape & Nature'}</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-xl">
            <ImageIcon className="w-6 h-6 text-green-600 flex-shrink-0" />
            <div>
              <span className="text-xs text-gray-400 font-bold block uppercase">Experience</span>
              <span className="font-bold text-gray-800">{user?.experience || '3+ Years'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* UPLOAD TODAY'S VIEW SECTION WITH CAMERA & LOCAL FILE PICK */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-2xl mx-auto space-y-6">
        <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Upload className="w-6 h-6 text-purple-600" /> Upload Today's View Photography
        </h3>
        <p className="text-xs text-gray-500">Snap live camera photos or select local files to give tourists real-time visibility.</p>

        {photoMsg && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-800 p-4 rounded-xl text-sm font-bold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" /> {photoMsg}
          </div>
        )}

        <form onSubmit={handlePhotoSubmit} className="space-y-5 text-sm">
          <div>
            <label className="block font-bold text-gray-700 mb-1">Target Destination</label>
            <select required className="w-full p-3 border rounded-xl outline-none" value={photoData.destinationId} onChange={e => setPhotoData({...photoData, destinationId: e.target.value})}>
              <option value="">Select Destination...</option>
              {destinations.map(d => <option key={d._id} value={d._id}>{d.name} ({d.state})</option>)}
            </select>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-2">Photo Source (Live Camera / Local File / URL)</label>
            <ImageCaptureUpload
              initialValue={photoData.imageUrl}
              onImageReady={(img) => setPhotoData(prev => ({ ...prev, imageUrl: img }))}
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Photo Description / Location Details</label>
            <input type="text" className="w-full p-3 border rounded-xl outline-none" value={photoData.caption} onChange={e => setPhotoData({...photoData, caption: e.target.value})} placeholder="e.g. Clear morning view at Araku viewpoint." />
          </div>

          <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2 shadow-lg text-base">
            <Upload className="w-5 h-5" /> Publish Live Photo
          </button>
        </form>
      </div>

      {/* MY UPLOADED PHOTOGRAPHY GALLERY WITH DELETE / DISCARD OPTION */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
        <h3 className="text-xl font-bold text-gray-900 border-b pb-3 flex items-center justify-between">
          <span>My Uploaded Photography Gallery ({myPhotos.length})</span>
          <span className="text-xs text-gray-400 font-normal">Discard or delete photos anytime</span>
        </h3>

        {loadingPhotos ? (
          <div className="py-8 text-center text-gray-500"><Loader2 className="w-6 h-6 animate-spin mx-auto text-purple-600 mb-1" /> Loading gallery...</div>
        ) : myPhotos.length === 0 ? (
          <div className="bg-gray-50 text-gray-500 p-8 rounded-xl text-center text-sm">No photos uploaded yet. Use the camera form above to upload your first live photo!</div>
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

export default PhotographerDashboard;
