import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/dashboard/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const UserDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, bookingsRes] = await Promise.all([
          api.get('/bookings/stats'),
          api.get('/bookings/my?limit=3'),
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

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingSpinner size="xl" text="Loading your dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="page-title">Good morning, {user?.name?.split(' ')[0]}! 👋</h1>
        <p className="section-subtitle">Here's what's happening with your bookings today.</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="📋"
          label="Total Bookings"
          value={stats?.totalBookings}
          gradient="bg-gradient-to-br from-blue-100 to-blue-200"
          delay={0}
        />
        <StatCard
          icon="⏰"
          label="Upcoming"
          value={stats?.upcomingBookings}
          gradient="bg-gradient-to-br from-orange-100 to-orange-200"
          delay={0.1}
        />
        <StatCard
          icon="✅"
          label="Completed"
          value={stats?.completedBookings}
          gradient="bg-gradient-to-br from-green-100 to-green-200"
          delay={0.2}
        />
        <StatCard
          icon="❌"
          label="Cancelled"
          value={stats?.cancelledBookings}
          gradient="bg-gradient-to-br from-red-100 to-red-200"
          delay={0.3}
        />
      </div>

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card"
      >
        <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            to="/services"
            id="quick-book-service"
            className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 hover:shadow-md transition-all hover:-translate-y-0.5"
          >
            <span className="text-2xl">🛠️</span>
            <div>
              <p className="font-semibold text-gray-800">Book a Service</p>
              <p className="text-xs text-gray-500">Browse available services</p>
            </div>
          </Link>
          <Link
            to="/bookings"
            id="quick-view-bookings"
            className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 hover:shadow-md transition-all hover:-translate-y-0.5"
          >
            <span className="text-2xl">📋</span>
            <div>
              <p className="font-semibold text-gray-800">My Bookings</p>
              <p className="text-xs text-gray-500">View all your bookings</p>
            </div>
          </Link>
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100">
            <span className="text-2xl">💬</span>
            <div>
              <p className="font-semibold text-gray-800">Support</p>
              <p className="text-xs text-gray-500">Get help anytime</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Recent bookings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">Recent Bookings</h2>
          <Link to="/bookings" className="text-orange-500 text-sm font-semibold hover:text-orange-600">
            View all →
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <div className="text-center py-10">
            <span className="text-5xl">📭</span>
            <p className="mt-3 text-gray-500 font-medium">No bookings yet</p>
            <p className="text-sm text-gray-400">Book your first service to get started!</p>
            <Link to="/services" className="btn-primary inline-block mt-4">
              Browse Services
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentBookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between p-4 rounded-xl bg-cream-50 border border-cream-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-200 to-pink-200 flex items-center justify-center text-lg">
                    🛠️
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{booking.service?.name}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(booking.bookingDate).toLocaleDateString('en-US', {
                        weekday: 'short', month: 'short', day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <span className={`badge ${statusColors[booking.bookingStatus?.status] || 'bg-gray-100 text-gray-700'}`}>
                  {booking.bookingStatus?.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default UserDashboard;
