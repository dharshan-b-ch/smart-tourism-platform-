import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Map, User, LogOut, Globe, ChevronDown } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t, LANGUAGES, currentLangObj } = useLanguage();

  const getDashboardPath = () => {
    if (!user || !user.role) return '/login';
    return `/${user.role.toLowerCase()}/dashboard`;
  };

  return (
    <nav className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3.5 flex justify-between items-center flex-wrap gap-2">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-2.5 text-xl font-extrabold tracking-tight">
          <Map className="w-7 h-7 text-blue-400" />
          <span>{t('brandName')}</span>
        </Link>

        {/* Navigation & Controls */}
        <div className="flex items-center space-x-4 md:space-x-6 text-sm font-medium">
          <Link to="/destinations" className="hover:text-blue-300 transition">{t('destinations')}</Link>
          <Link to="/planner" className="hover:text-blue-300 transition">{t('aiPlanner')}</Link>

          {user ? (
            <div className="flex items-center space-x-3">
              <Link to={getDashboardPath()} className="flex items-center space-x-1.5 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg border border-white/20 transition text-xs sm:text-sm">
                <User className="w-4 h-4 text-blue-300" />
                <span className="font-bold">{user.name}</span>
                <span className="text-[10px] bg-blue-500/80 px-1.5 py-0.5 rounded uppercase font-extrabold ml-1">{user.role}</span>
              </Link>
              <button onClick={logout} className="flex items-center space-x-1 hover:text-red-300 transition text-xs opacity-90">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">{t('logout')}</span>
              </button>
            </div>
          ) : (
            <Link to="/login" className="bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg font-bold transition shadow-md text-xs sm:text-sm">
              {t('loginRegister')}
            </Link>
          )}

          {/* TOP-RIGHT INDIAN LANGUAGE SELECTOR */}
          <div className="relative group">
            <div className="flex items-center space-x-1 bg-white/10 hover:bg-white/20 px-2.5 py-1.5 rounded-lg border border-white/20 cursor-pointer text-xs font-bold transition">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>{currentLangObj.native}</span>
              <ChevronDown className="w-3.5 h-3.5 text-blue-300" />
            </div>

            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-black"
              title="Select Language"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="text-gray-900 bg-white p-2">
                  {lang.native} — {lang.name}
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
