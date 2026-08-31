import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import AIAssistantWidget from './components/AIAssistantWidget';
import TripPlanReminderWidget from './components/TripPlanReminderWidget';
import LandingPage from './pages/LandingPage';
import AIPlanner from './pages/AIPlanner';
import DestinationSearch from './pages/DestinationSearch';
import DestinationDetail from './pages/DestinationDetail';
import LoginPortal from './pages/LoginPortal';
import ProtectedRoute from './components/ProtectedRoute';

import AdminDashboard from './pages/dashboards/AdminDashboard';
import TouristDashboard from './pages/dashboards/TouristDashboard';
import GuideDashboard from './pages/dashboards/GuideDashboard';
import PhotographerDashboard from './pages/dashboards/PhotographerDashboard';

function App() {
  return (
    <LanguageProvider>
      <Router>
        <div className="min-h-screen bg-subtle-travel flex flex-col font-sans relative">
          
          {/* Hidden Google Translate Mount Point for Full-Website Translation */}
          <div id="google_translate_element" style={{ display: 'none' }}></div>

          <Navbar />

          <main className="flex-grow container mx-auto p-4 py-8">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPortal />} />
              
              {/* ROLE-SPECIFIC DASHBOARD ROUTES */}
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/tourist/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['TOURIST']}>
                    <TouristDashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/guide/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['GUIDE']}>
                    <GuideDashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/photographer/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['PHOTOGRAPHER']}>
                    <PhotographerDashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Legacy Dashboard Redirect */}
              <Route path="/dashboard" element={<Navigate to="/login" replace />} />

              <Route path="/planner" element={<AIPlanner />} />
              <Route path="/destinations" element={<DestinationSearch />} />
              <Route path="/destinations/:id" element={<DestinationDetail />} />
            </Routes>
          </main>

          {/* TRIP PLAN REMINDER WIDGET */}
          <TripPlanReminderWidget />

          {/* FLOATING AI ASSISTANT WIDGET */}
          <AIAssistantWidget />

          <footer className="bg-gray-900 text-gray-400 text-center p-6 text-sm border-t border-gray-800">
            <p>&copy; {new Date().getFullYear()} Smart Tourism Intelligence Platform. All rights reserved.</p>
          </footer>
        </div>
      </Router>
    </LanguageProvider>
  );
}

export default App;
