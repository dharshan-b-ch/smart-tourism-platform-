import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="text-center py-20 font-bold text-gray-600">Verifying security credentials...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user.role ? user.role.toUpperCase() : '';
  const normalizedAllowed = allowedRoles.map(r => r.toUpperCase());

  if (!normalizedAllowed.includes(userRole)) {
    return (
      <div className="max-w-2xl mx-auto my-16 bg-white p-8 rounded-2xl shadow-xl border border-red-100 text-center animate-fade-in">
        <div className="bg-red-100 text-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">403 — Access Denied</h2>
        <p className="text-gray-600 mb-6">You do not have permission to access this page. This area is restricted to <span className="font-bold text-red-600">{normalizedAllowed.join(' or ')}</span> users.</p>
        <div className="text-sm bg-gray-50 p-3 rounded-lg border text-gray-500 mb-6">
          Logged in as: <span className="font-bold text-gray-800">{user.email} ({userRole})</span>
        </div>
        <a href="/" className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-700 transition">
          Return to Safety
        </a>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
