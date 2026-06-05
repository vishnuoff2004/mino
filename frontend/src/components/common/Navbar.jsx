import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { useState } from 'react';

const Navbar = ({ onMenuClick }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-cream-200 shadow-soft">
      <div className="flex items-center justify-between px-4 md:px-6 h-16">
        {/* Left: menu button + logo */}
        <div className="flex items-center gap-3">
          <button
            id="nav-menu-btn"
            onClick={onMenuClick}
            className="p-2 rounded-xl hover:bg-cream-100 text-gray-600 lg:hidden transition-colors"
            aria-label="Open menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link to={isAdmin ? '/admin' : '/dashboard'} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm">
              B
            </div>
            <span className="font-bold text-gray-800 hidden sm:block">BookEase</span>
          </Link>
        </div>

        {/* Right: user menu */}
        <div className="relative">
          <button
            id="user-menu-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-cream-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-300 to-pink-300 flex items-center justify-center text-white font-semibold text-sm">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-gray-800 leading-tight">{user?.name}</p>
              <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
            </div>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {dropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-card border border-cream-100 overflow-hidden z-50"
            >
              <div className="px-4 py-3 border-b border-cream-100">
                <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                <p className="text-xs text-gray-400">{user?.email}</p>
              </div>
              <div className="p-1">
                <Link
                  to={isAdmin ? '/admin' : '/dashboard'}
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-cream-100 text-gray-700 text-sm transition-colors"
                >
                  <span>🏠</span> Dashboard
                </Link>
                <button
                  id="logout-btn"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-red-50 text-red-500 text-sm transition-colors"
                >
                  <span>🚪</span> Logout
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
