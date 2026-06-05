import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const userLinks = [
  { to: '/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/services', icon: '🛠️', label: 'Services' },
  { to: '/bookings', icon: '📋', label: 'My Bookings' },
];

const adminLinks = [
  { to: '/admin', icon: '📊', label: 'Dashboard', end: true },
  { to: '/admin/services', icon: '🛠️', label: 'Manage Services' },
  { to: '/admin/providers', icon: '👷', label: 'Manage Providers' },
  { to: '/admin/bookings', icon: '📋', label: 'Manage Bookings' },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { isAdmin } = useAuth();
  const links = isAdmin ? adminLinks : userLinks;

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
            {isAdmin ? 'Admin Panel' : 'Navigation'}
          </p>
          {links.map(({ to, icon, label, end }) => (
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
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-cream-100">
          <div className="text-xs text-gray-400 text-center">
            BookEase v1.0 · Built with ❤️
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
