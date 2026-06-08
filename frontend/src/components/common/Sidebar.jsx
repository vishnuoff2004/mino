import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

const userLinks = [
  { to: '/dashboard', icon: '📊', labelKey: 'sidebar.dashboard' },
  { to: '/services', icon: '🛠️', labelKey: 'sidebar.services' },
  { to: '/bookings', icon: '📋', labelKey: 'sidebar.bookings' },
];

const adminLinks = [
  { to: '/admin', icon: '📊', labelKey: 'sidebar.dashboard', end: true },
  { to: '/admin/services', icon: '🛠️', labelKey: 'sidebar.manage_services' },
  { to: '/admin/providers', icon: '👷', labelKey: 'sidebar.manage_providers' },
  { to: '/admin/bookings', icon: '📋', labelKey: 'sidebar.manage_bookings' },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { isAdmin } = useAuth();
  const { t, i18n } = useTranslation();
  const links = isAdmin ? adminLinks : userLinks;

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng);
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white border-r border-cream-200 z-40
          flex flex-col overflow-y-auto
          transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)]
          ${isOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full'}
        `}
        style={{position:'fixed'}}
      >
        <nav className="flex-1 p-4 space-y-1" >
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-3">
            {isAdmin ? t('sidebar.admin_panel') : t('sidebar.navigation')}
          </p>
          {links.map(({ to, icon, labelKey, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                isActive ? 'sidebar-link-active' : 'sidebar-link'
              }
            >
              <span className="text-lg">{icon}</span>
              <span>{t(labelKey)}</span>
            </NavLink>
          ))}
        </nav>

        {/* Language Switcher */}
        <div className="p-4 border-t border-cream-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1 mb-2">
            {t('sidebar.language')}
          </p>
          <div className="flex gap-2 px-1">
            <button
              onClick={() => changeLanguage('en')}
              className={`flex-1 py-1.5 px-3 rounded-xl text-sm font-semibold transition-all ${
                i18n.language === 'en'
                  ? 'bg-gradient-to-r from-orange-400 to-pink-400 text-white shadow-md'
                  : 'bg-cream-50 text-gray-600 hover:bg-cream-100'
              }`}
            >
              🇬🇧 {t('lang.en')}
            </button>
            <button
              onClick={() => changeLanguage('ta')}
              className={`flex-1 py-1.5 px-3 rounded-xl text-sm font-semibold transition-all ${
                i18n.language === 'ta'
                  ? 'bg-gradient-to-r from-orange-400 to-pink-400 text-white shadow-md'
                  : 'bg-cream-50 text-gray-600 hover:bg-cream-100'
              }`}
            >
              🇮🇳 {t('lang.ta')}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-cream-100">
          <div className="text-xs text-gray-400 text-center">
            {t('sidebar.footer')}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
