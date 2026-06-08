import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import { useTranslation } from 'react-i18next';
import { tl } from '../../utils/translate';
import StatCard from '../../components/dashboard/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';

const AdminDashboard = () => {
  const { t, i18n } = useTranslation();
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, bookingsRes] = await Promise.all([
          api.get('/admin/dashboard'),
          api.get('/admin/bookings?limit=5'),
        ]);
        setStats(statsRes.data.stats);
        setRecentBookings(bookingsRes.data.bookings);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const lang = i18n.language;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingSpinner size="xl" text={t('dashboard.admin.loading')} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="page-title">{t('dashboard.admin.title')}</h1>
        <p className="section-subtitle">{t('dashboard.admin.subtitle')}</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="📋" label={t('dashboard.admin.total_bookings')} value={stats?.totalBookings} gradient="bg-gradient-to-br from-blue-100 to-blue-200" delay={0} />
        <StatCard icon="💰" label={t('dashboard.admin.revenue')} value={`$${stats?.revenue}`} gradient="bg-gradient-to-br from-green-100 to-emerald-200" delay={0.1} />
        <StatCard icon="👷" label={t('dashboard.admin.total_providers')} value={stats?.totalProviders} gradient="bg-gradient-to-br from-purple-100 to-purple-200" delay={0.2} />
        <StatCard icon="🟢" label={t('dashboard.admin.available_now')} value={stats?.availableProviders} gradient="bg-gradient-to-br from-orange-100 to-orange-200" delay={0.3} />
      </div>

      {/* Booking status breakdown */}
      {stats?.bookingsByStatus?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card">
          <h2 className="text-lg font-bold text-gray-800 mb-4">{t('dashboard.admin.by_status')}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.bookingsByStatus.map(({ status, count }) => (
              <div key={status} className="text-center p-4 rounded-2xl bg-cream-50 border border-cream-100">
                <p className="text-3xl font-bold text-gray-800">{count}</p>
                <StatusBadge status={status} />
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent Bookings */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="card overflow-hidden p-0">
        <div className="p-6 border-b border-cream-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">{t('dashboard.admin.recent_bookings')}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-cream-50">
              <tr>
                {[t('dashboard.admin.table_id'), t('dashboard.admin.table_customer'), t('dashboard.admin.table_service'), t('dashboard.admin.table_provider'), t('dashboard.admin.table_date'), t('dashboard.admin.table_status')].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100">
              {recentBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-cream-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-400 font-mono">#{booking.id}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{booking.user?.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{tl(booking.service, 'name', lang, t)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{tl(booking.provider, 'name', lang, t)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(booking.bookingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={booking.bookingStatus?.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {recentBookings.length === 0 && (
            <div className="text-center py-10 text-gray-500">{t('dashboard.admin.no_bookings')}</div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
