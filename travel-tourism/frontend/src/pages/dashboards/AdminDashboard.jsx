import { useState, useEffect } from 'react';
import api from '../../services/api';
import MapComponent from '../../components/MapComponent';
import { ShieldCheck, Users, CheckCircle, XCircle, Ban, RefreshCw, Loader2, UserCheck, Camera, Trash2, Image as ImageIcon, MapPin, Navigation, Compass } from 'lucide-react';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [pendingGuides, setPendingGuides] = useState([]);
  const [pendingPhotos, setPendingPhotos] = useState([]);
  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [allPhotos, setAllPhotos] = useState([]);
  const [guideGpsUpdates, setGuideGpsUpdates] = useState([]);
  const [selectedGpsUpdate, setSelectedGpsUpdate] = useState(null);

  const [roleFilter, setRoleFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState(null);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const usersRes = await api.get(`/admin/users?role=${roleFilter}`);
      setUsers(usersRes.data.data);

      const guidesRes = await api.get('/admin/guides/pending');
      setPendingGuides(guidesRes.data.data);

      const photosRes = await api.get('/admin/photographers/pending');
      setPendingPhotos(photosRes.data.data);

      const adminsRes = await api.get('/admin/admins/pending');
      setPendingAdmins(adminsRes.data.data);

      const allPhotosRes = await api.get('/intelligence/photos/manage/all');
      setAllPhotos(allPhotosRes.data.data);

      const gpsRes = await api.get('/intelligence/guide-location-updates/all');
      setGuideGpsUpdates(gpsRes.data.data);
      if (gpsRes.data.data?.length > 0) {
        setSelectedGpsUpdate(gpsRes.data.data[0]);
      }
    } catch (err) {
      console.error("Admin fetch error", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAdminData();
  }, [roleFilter]);

  const handleApproveGuide = async (id) => {
    try {
      await api.patch(`/admin/users/${id}/approve`);
      setActionMsg('Application approved successfully!');
      fetchAdminData();
    } catch (err) { alert('Approval failed'); }
  };

  const handleRejectGuide = async (id) => {
    try {
      await api.patch(`/admin/users/${id}/reject`);
      setActionMsg('Application rejected.');
      fetchAdminData();
    } catch (err) { alert('Rejection failed'); }
  };

  const handleApprovePhotographer = async (id) => {
    try {
      await api.patch(`/admin/photographers/${id}/approve`);
      setActionMsg('Photographer approved successfully!');
      fetchAdminData();
    } catch (err) { alert('Approval failed'); }
  };

  const handleRejectPhotographer = async (id) => {
    try {
      await api.patch(`/admin/photographers/${id}/reject`);
      setActionMsg('Photographer application rejected.');
      fetchAdminData();
    } catch (err) { alert('Rejection failed'); }
  };

  const handleToggleSuspend = async (id, currentStatus) => {
    try {
      if (currentStatus === 'SUSPENDED') {
        await api.patch(`/admin/users/${id}/activate`);
        setActionMsg('User account reactivated.');
      } else {
        await api.patch(`/admin/users/${id}/suspend`);
        setActionMsg('User account suspended.');
      }
      fetchAdminData();
    } catch (err) { alert('Action failed'); }
  };

  const handleDeletePhotoAdmin = async (photoId) => {
    if (!window.confirm("As Admin, are you sure you want to delete/remove this photo from the platform?")) return;
    try {
      await api.delete(`/intelligence/photo/${photoId}`);
      setActionMsg('Photo deleted from platform by admin.');
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete photo');
    }
  };

  const handleDeleteGpsUpdateAdmin = async (updateId) => {
    if (!window.confirm("As Admin, are you sure you want to delete this Guide GPS Location Proof?")) return;
    try {
      await api.delete(`/intelligence/guide-location-update/${updateId}`);
      setActionMsg('Guide GPS Location update deleted by admin.');
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete update');
    }
  };

  return (
    <div className="space-y-10 animate-fade-in max-w-7xl mx-auto pb-16">
      
      {/* Admin Title Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-black text-white p-8 rounded-3xl shadow-xl flex justify-between items-center flex-wrap gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-300 font-bold text-xs uppercase tracking-widest mb-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" /> Platform Administration Panel
          </div>
          <h1 className="text-4xl font-extrabold">Admin Command Dashboard</h1>
          <p className="text-sm opacity-80 mt-1">Manage platform users, review pending applications (Admins, Guides, Photographers), and verify Guide GPS proofs.</p>
        </div>
        <button onClick={fetchAdminData} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 border border-white/20 transition">
          <RefreshCw className="w-4 h-4" /> Refresh Telemetry
        </button>
      </div>

      {actionMsg && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-800 p-4 rounded-xl text-sm font-bold flex justify-between items-center">
          <span>✅ {actionMsg}</span>
          <button onClick={() => setActionMsg(null)} className="text-xs text-gray-500 hover:text-gray-900">Dismiss</button>
        </div>
      )}

      {/* FEATURE AREA 4: GUIDE GPS LOCATION PROOF UPDATES (ADMIN VIEW) */}
      <div className="bg-white rounded-3xl shadow-md border border-emerald-100 p-6 sm:p-8 space-y-6">
        <div className="flex justify-between items-center border-b pb-4 flex-wrap gap-4">
          <div>
            <h3 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
              <Navigation className="w-6 h-6 text-emerald-600 transform rotate-45" /> Guide GPS Photo Proof Updates ({guideGpsUpdates.length})
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Review verified guide location proofs with attached GPS coordinates, server date, and time.
            </p>
          </div>
          <span className="text-xs bg-emerald-100 text-emerald-800 font-extrabold px-3 py-1.5 rounded-full">
            📍 Verified GPS & Server Timestamps
          </span>
        </div>

        {guideGpsUpdates.length === 0 ? (
          <div className="bg-gray-50 text-gray-500 p-8 rounded-xl text-center text-sm">
            No Guide GPS location proof updates uploaded yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Updates List */}
            <div className="lg:col-span-2 space-y-4 max-h-[550px] overflow-y-auto pr-2">
              {guideGpsUpdates.map(update => (
                <div 
                  key={update._id}
                  onClick={() => setSelectedGpsUpdate(update)}
                  className={`border rounded-2xl p-4 transition-all cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
                    selectedGpsUpdate?._id === update._id ? 'bg-emerald-50 border-emerald-500 shadow-md ring-2 ring-emerald-300' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <img src={update.imageUrl} alt={update.placeName} className="w-20 h-20 object-cover rounded-xl shadow-sm flex-shrink-0" />
                    <div className="space-y-1">
                      <div className="font-extrabold text-gray-900 text-base">{update.placeName || 'Verified Location'}</div>
                      <div className="text-xs font-bold text-emerald-700">Guide: {update.guideName || update.guideId?.name}</div>
                      <div className="text-[11px] text-gray-500">
                        <span>📅 {new Date(update.timestamp || update.createdAt).toLocaleDateString()}</span> • 
                        <span className="ml-1">🕐 {new Date(update.timestamp || update.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <div className="text-[11px] font-mono text-gray-600">
                        GPS: <b>{update.latitude.toFixed(4)}, {update.longitude.toFixed(4)}</b>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setSelectedGpsUpdate(update); }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition shadow-sm flex items-center gap-1"
                    >
                      🗺️ View Map
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleDeleteGpsUpdateAdmin(update._id); }}
                      className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg transition shadow-sm"
                      title="Delete Update as Admin"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Map View for Selected GPS Update */}
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3 flex flex-col justify-between">
              <div>
                <h4 className="font-extrabold text-gray-900 text-sm flex items-center justify-between">
                  <span>Selected Location Map</span>
                  <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">Interactive Map</span>
                </h4>
                {selectedGpsUpdate ? (
                  <p className="text-xs text-gray-600 mt-1">
                    <b>{selectedGpsUpdate.placeName}</b> ({selectedGpsUpdate.latitude.toFixed(4)}, {selectedGpsUpdate.longitude.toFixed(4)})
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 mt-1">Select an update on the left to inspect on map.</p>
                )}
              </div>

              {selectedGpsUpdate ? (
                <MapComponent
                  center={{ lat: selectedGpsUpdate.latitude, lng: selectedGpsUpdate.longitude }}
                  title={`${selectedGpsUpdate.placeName} (Guide: ${selectedGpsUpdate.guideName})`}
                />
              ) : (
                <div className="h-64 bg-gray-200 rounded-xl flex items-center justify-center text-xs text-gray-500">
                  Select a Guide GPS Update above to load map view.
                </div>
              )}
            </div>

          </div>
        )}
      </div>

      {/* PENDING APPLICATIONS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Pending Admin Applications */}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-indigo-100">
          <h3 className="text-xl font-extrabold text-gray-900 mb-4 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-indigo-600" /> Pending Admin Candidates ({pendingAdmins.length})
          </h3>
          {pendingAdmins.length === 0 ? (
            <div className="bg-gray-50 text-gray-500 p-6 rounded-xl text-center text-sm">No pending admin registration requests.</div>
          ) : (
            <div className="space-y-4">
              {pendingAdmins.map(adminCandidate => (
                <div key={adminCandidate._id} className="border rounded-xl p-4 bg-indigo-50/50 flex justify-between items-start flex-wrap gap-4 border-indigo-200">
                  <div>
                    <h4 className="font-bold text-gray-900 text-base">{adminCandidate.name}</h4>
                    <p className="text-xs text-gray-500">{adminCandidate.email} • Phone: {adminCandidate.phone || 'N/A'}</p>
                    <p className="text-xs text-indigo-800 mt-1 font-semibold">{adminCandidate.description || 'Admin Candidate'}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleApproveGuide(adminCandidate._id)} className="bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-800 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Approve Admin
                    </button>
                    <button onClick={() => handleRejectGuide(adminCandidate._id)} className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-700 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Guides */}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
          <h3 className="text-xl font-extrabold text-gray-900 mb-4 flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-green-600" /> Pending Guides ({pendingGuides.length})
          </h3>
          {pendingGuides.length === 0 ? (
            <div className="bg-gray-50 text-gray-500 p-6 rounded-xl text-center text-sm">No pending guide verification requests.</div>
          ) : (
            <div className="space-y-4">
              {pendingGuides.map(guide => (
                <div key={guide._id} className="border rounded-xl p-4 bg-gray-50 flex justify-between items-start flex-wrap gap-4">
                  <div>
                    <h4 className="font-bold text-gray-900 text-base">{guide.name}</h4>
                    <p className="text-xs text-gray-500">{guide.email} • Phone: {guide.phone || 'N/A'}</p>
                    <div className="mt-2 text-xs space-y-1">
                      <p><span className="font-semibold text-gray-700">Location:</span> {guide.serviceLocation}</p>
                      <p><span className="font-semibold text-gray-700">Languages:</span> {guide.languages?.join(', ')}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleApproveGuide(guide._id)} className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-700 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button onClick={() => handleRejectGuide(guide._id)} className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-700 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Photographers */}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
          <h3 className="text-xl font-extrabold text-gray-900 mb-4 flex items-center gap-2">
            <Camera className="w-6 h-6 text-purple-600" /> Pending Photographers ({pendingPhotos.length})
          </h3>
          {pendingPhotos.length === 0 ? (
            <div className="bg-gray-50 text-gray-500 p-6 rounded-xl text-center text-sm">No pending photographer verification requests.</div>
          ) : (
            <div className="space-y-4">
              {pendingPhotos.map(photo => (
                <div key={photo._id} className="border rounded-xl p-4 bg-gray-50 flex justify-between items-start flex-wrap gap-4">
                  <div>
                    <h4 className="font-bold text-gray-900 text-base">{photo.name}</h4>
                    <p className="text-xs text-gray-500">{photo.email} • Phone: {photo.phone || 'N/A'}</p>
                    <div className="mt-2 text-xs space-y-1">
                      <p><span className="font-semibold text-gray-700">Location:</span> {photo.serviceLocation}</p>
                      <p><span className="font-semibold text-gray-700">Type:</span> {photo.photographyType}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleApprovePhotographer(photo._id)} className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-700 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button onClick={() => handleRejectPhotographer(photo._id)} className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-700 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* PHOTO MODERATION & CONTENT MANAGEMENT */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 space-y-6">
        <h3 className="text-xl font-extrabold text-gray-900 border-b pb-3 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-purple-600" /> Destination Photo Moderation & Content Management ({allPhotos.length})
          </span>
          <span className="text-xs text-gray-400 font-normal">Admin can delete bad or invalid photos</span>
        </h3>

        {allPhotos.length === 0 ? (
          <div className="bg-gray-50 text-gray-500 p-8 rounded-xl text-center text-sm">No destination photos uploaded on the platform yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {allPhotos.map(photo => (
              <div key={photo._id} className="bg-gray-50 border rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between group hover:shadow-md transition">
                <div className="relative h-44 bg-black">
                  <img src={photo.imageUrl} alt={photo.description || 'Destination photo'} className="w-full h-full object-cover" />
                  <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    photo.status === 'Verified' ? 'bg-green-600 text-white' : 'bg-yellow-500 text-white'
                  }`}>
                    {photo.status}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleDeletePhotoAdmin(photo._id)}
                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-xl shadow-lg transition flex items-center gap-1 text-[10px] font-bold"
                    title="Delete Photo as Admin"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>

                <div className="p-3 space-y-1 text-xs">
                  <div className="font-bold text-gray-900 text-sm">
                    {photo.destinationId?.name || 'Destination'}
                  </div>
                  <p className="text-gray-600 line-clamp-2">{photo.description || photo.location || 'No description'}</p>
                  <div className="pt-2 border-t text-[10px] text-gray-400 flex justify-between">
                    <span>Uploaded by: <b>{photo.uploaderId?.name || photo.uploaderRole}</b></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* USER MANAGEMENT SYSTEM */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <h3 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" /> Platform User Directory
          </h3>
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500">Filter Role:</span>
            <select 
              className="bg-gray-50 border p-2 rounded-lg text-xs font-bold text-gray-700 outline-none"
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
            >
              <option value="ALL">All Roles</option>
              <option value="TOURIST">Tourists</option>
              <option value="GUIDE">Guides</option>
              <option value="PHOTOGRAPHER">Photographers</option>
              <option value="ADMIN">Admins</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-500"><Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-2" /> Loading Directory...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs font-bold text-gray-600 uppercase border-b">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Details</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map(u => (
                  <tr key={u._id} className="hover:bg-gray-50">
                    <td className="p-3">
                      <div className="font-bold text-gray-900">{u.name}</div>
                      <div className="text-xs text-gray-500">{u.email}</div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        u.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-800' :
                        u.role === 'GUIDE' ? 'bg-green-100 text-green-800' :
                        u.role === 'PHOTOGRAPHER' ? 'bg-purple-100 text-purple-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        u.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        u.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        u.status === 'SUSPENDED' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-gray-600">
                      {u.serviceLocation && <div>Location: {u.serviceLocation}</div>}
                      {u.phone && <div>Phone: {u.phone}</div>}
                    </td>
                    <td className="p-3">
                      {u.role !== 'ADMIN' && (
                        <button 
                          onClick={() => handleToggleSuspend(u._id, u.status)}
                          className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1 transition ${
                            u.status === 'SUSPENDED' ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                          }`}
                        >
                          <Ban className="w-3 h-3" /> {u.status === 'SUSPENDED' ? 'Reactivate' : 'Suspend'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default AdminDashboard;
