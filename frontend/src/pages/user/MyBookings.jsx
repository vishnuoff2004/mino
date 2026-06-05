import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import StatusBadge from '../../components/common/StatusBadge';
import { SkeletonTable } from '../../components/common/SkeletonCard';
import { Link } from 'react-router-dom';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const res = await api.get('/bookings/my', { params: { page, limit: 8 } });
        setBookings(res.data.bookings);
        setPagination(res.data.pagination);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [page]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">My Bookings</h1>
        <p className="section-subtitle">Track all your service bookings</p>
      </div>

      {loading ? (
        <SkeletonTable rows={6} />
      ) : bookings.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card text-center py-16">
          <span className="text-6xl">📭</span>
          <p className="mt-4 text-xl font-semibold text-gray-700">No bookings yet</p>
          <p className="text-gray-500 mt-1">Start by booking a service!</p>
          <Link to="/services" className="btn-primary inline-block mt-6">
            Browse Services
          </Link>
        </motion.div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-cream-50 border-b border-cream-200">
                  <tr>
                    {['#', 'Service', 'Provider', 'Date', 'Address', 'Status'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-100">
                  {bookings.map((booking, i) => (
                    <motion.tr
                      key={booking.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="hover:bg-cream-50 transition-colors"
                    >
                      <td className="px-4 py-4 text-sm text-gray-400 font-mono">#{booking.id}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-200 to-amber-200 flex items-center justify-center text-sm">🛠️</div>
                          <div>
                            <p className="font-semibold text-gray-800 text-sm">{booking.service?.name}</p>
                            <p className="text-xs text-gray-400">${parseFloat(booking.service?.price || 0).toFixed(2)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-medium text-gray-700">{booking.provider?.name}</p>
                        <p className="text-xs text-gray-400">{booking.provider?.skill_type}</p>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {new Date(booking.bookingDate).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600 max-w-[200px] truncate">
                        {booking.address}
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={booking.bookingStatus?.status} />
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing page {page} of {pagination.totalPages} ({pagination.total} bookings)
              </p>
              <div className="flex gap-2">
                <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="btn-secondary disabled:opacity-50 px-4 py-2 text-sm">
                  ← Prev
                </button>
                <button disabled={page === pagination.totalPages} onClick={() => setPage((p) => p + 1)} className="btn-secondary disabled:opacity-50 px-4 py-2 text-sm">
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyBookings;
