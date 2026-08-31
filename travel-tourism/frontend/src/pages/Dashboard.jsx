import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Compass, Calendar, Heart, MessageSquare, Camera, AlertTriangle, CheckSquare, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [destinations, setDestinations] = useState([]);
  const [formData, setFormData] = useState({ destinationId: '', imageUrl: '', location: '', description: '' });
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    if (user && ['guide', 'contributor', 'photographer'].includes(user.role)) {
      api.get('/destinations').then(res => setDestinations(res.data.data)).catch(console.error);
    }
  }, [user]);

  const handleUploadPhoto = async (e) => {
    e.preventDefault();
    try {
      await api.post('/intelligence/photo', formData);
      setMsg("Photo uploaded successfully! Waiting for Admin verification.");
      setTimeout(() => { setShowPhotoModal(false); setMsg(null); }, 3000);
    } catch (err) {
      setMsg("Failed to upload photo.");
    }
  };

  if (!user) return <div className="text-center py-20">Please login.</div>;

  return (
    <div className="relative">
      <h2 className="text-3xl font-bold mb-8">Welcome, {user.name} ({user.role})</h2>
      
      {/* TOURIST VIEW */}
      {user.role === 'tourist' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link to="/planner" className="bg-blue-50 p-6 rounded-lg shadow hover:shadow-md transition text-center group">
            <Calendar className="w-12 h-12 mx-auto text-blue-600 mb-4 group-hover:scale-110 transition" />
            <h3 className="font-bold text-lg mb-2">AI Trip Planner</h3>
            <p className="text-sm text-gray-600">Create a smart itinerary</p>
          </Link>
          <Link to="/destinations" className="bg-green-50 p-6 rounded-lg shadow hover:shadow-md transition text-center group">
            <Compass className="w-12 h-12 mx-auto text-green-600 mb-4 group-hover:scale-110 transition" />
            <h3 className="font-bold text-lg mb-2">Explore Places</h3>
            <p className="text-sm text-gray-600">Discover new destinations</p>
          </Link>
        </div>
      )}

      {/* CONTRIBUTOR / GUIDE / PHOTOGRAPHER VIEW */}
      {['guide', 'contributor', 'photographer'].includes(user.role) && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-800">Local Contributor Dashboard</h3>
              <p className="text-gray-600">Status: {user.isVerified ? <span className="text-green-600 font-bold">Verified</span> : <span className="text-yellow-600 font-bold">Pending Verification</span>}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg shadow border border-blue-100">
              <Camera className="w-10 h-10 text-blue-600 mb-4" />
              <h3 className="font-bold text-lg mb-2">Upload Today's View</h3>
              <p className="text-sm text-gray-600 mb-4">Share current condition photos of tourist places. Will be verified by Admin.</p>
              <button onClick={() => setShowPhotoModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded font-medium text-sm hover:bg-blue-700">Upload Photo</button>
            </div>
            
            <div className="bg-orange-50 p-6 rounded-lg shadow border border-orange-100">
              <AlertTriangle className="w-10 h-10 text-orange-600 mb-4" />
              <h3 className="font-bold text-lg mb-2">Report Local Condition</h3>
              <p className="text-sm text-gray-600 mb-4">Report traffic, road blocks, heavy rain, or crowd levels.</p>
              <button className="bg-orange-600 text-white px-4 py-2 rounded font-medium text-sm hover:bg-orange-700">Submit Report</button>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN VIEW */}
      {user.role === 'admin' && (
        <div className="space-y-6">
          <div className="bg-indigo-900 text-white p-6 rounded-lg shadow-sm">
            <h3 className="text-2xl font-bold mb-2">Tourism Intelligence Center</h3>
            <p className="opacity-90">Approve or reject community information to keep tourists safe.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow border">
              <CheckSquare className="w-8 h-8 text-indigo-600 mb-3" />
              <h3 className="font-bold text-lg mb-4">Pending Photo Verifications</h3>
              <button className="text-indigo-600 font-medium text-sm border border-indigo-600 px-4 py-2 rounded hover:bg-indigo-50">Review Queue</button>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border">
              <CheckSquare className="w-8 h-8 text-indigo-600 mb-3" />
              <h3 className="font-bold text-lg mb-4">Pending Local Reports</h3>
              <button className="text-indigo-600 font-medium text-sm border border-indigo-600 px-4 py-2 rounded hover:bg-indigo-50">Review Queue</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL */}
      {showPhotoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md relative">
            <button onClick={() => setShowPhotoModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-black"><X/></button>
            <h3 className="text-2xl font-bold mb-4">Upload Today's Photo</h3>
            {msg && <div className="mb-4 p-2 bg-blue-100 text-blue-700 text-sm rounded">{msg}</div>}
            <form onSubmit={handleUploadPhoto} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Destination</label>
                <select required className="w-full border p-2 rounded" onChange={e => setFormData({...formData, destinationId: e.target.value})}>
                  <option value="">Select Destination</option>
                  {destinations.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Image URL</label>
                <input required type="url" placeholder="https://..." className="w-full border p-2 rounded" onChange={e => setFormData({...formData, imageUrl: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium">Location / Viewpoint</label>
                <input required type="text" placeholder="e.g. Main Temple" className="w-full border p-2 rounded" onChange={e => setFormData({...formData, location: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium">Description</label>
                <textarea required className="w-full border p-2 rounded" onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded font-bold hover:bg-blue-700">Submit for Verification</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
