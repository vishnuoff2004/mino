import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { SkeletonTable } from '../../components/common/SkeletonCard';

const STATUS_OPTIONS = [
  { id: 1, label: '⏳ Pending', value: 'pending' },
  { id: 2, label: '✅ Confirmed', value: 'confirmed' },
  { id: 3, label: '🎉 Completed', value: 'completed' },
  { id: 4, label: '❌ Cancelled', value: 'cancelled' },
];

const StatusModal = ({ booking, onClose, onSave }) => {
  const [selectedStatus, setSelectedStatus] = useState(booking.bookingStatusId);
  const [submitting, setSubmitting] = useState(false);

  const handleUpdate = async () => {
    setSubmitting(true);
    try {
      await api.put(`/admin/bookings/${booking.id}/status`, { bookingStatusId: selectedStatus });
      toast.success('Booking status updated!');
      onSave();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm"
      >
        <h2 className="text-xl font-bold text-gray-800 mb-2">Update Booking Status</h2>
        <p className="text-sm text-gray-500 mb-5">
          Booking #{booking.id} · {booking.user?.name}
        </p>

        <div className="space-y-2 mb-6">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSelectedStatus(opt.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${
                selectedStatus === opt.id
                  ? 'border-orange-400 bg-orange-50'
                  : 'border-cream-200 hover:border-orange-200'
              }`}
            >
              <span className="font-medium text-gray-700">{opt.label}</span>
              {selectedStatus === opt.id && <span className="text-orange-500 font-bold">✓</span>}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleUpdate} disabled={submitting} className="btn-primary flex-1">
            {submitting ? <LoadingSpinner size="sm" /> : 'Update Status'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/bookings', {
        params: { page, limit: 10, status: statusFilter },
      });
      setBookings(res.data.bookings);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, [page, statusFilter]);
  useEffect(() => { setPage(1); }, [statusFilter]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Manage Bookings</h1>
        <p className="section-subtitle">View and update all booking statuses</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {['', 'pending', 'confirmed', 'completed', 'cancelled'].map((s) => (
          <button
            key={s}
            id={`filter-${s || 'all'}`}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              statusFilter === s
                ? 'bg-gradient-to-r from-orange-400 to-pink-400 text-white shadow-md'
                : 'bg-white text-gray-600 border border-cream-200 hover:border-orange-300'
            }`}
          >
            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <SkeletonTable rows={8} />
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-cream-50 border-b border-cream-200">
                <tr>
                  {['#', 'Customer', 'Service', 'Provider', 'Date', 'Address', 'Status', 'Action'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {bookings.map((booking, i) => (
                  <motion.tr key={booking.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="hover:bg-cream-50 transition-colors">
                    <td className="px-4 py-4 text-sm text-gray-400 font-mono">#{booking.id}</td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-gray-800 text-sm">{booking.user?.name}</p>
                      <p className="text-xs text-gray-400">{booking.user?.email}</p>
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <p className="font-medium text-gray-700">{booking.service?.name}</p>
                      <p className="text-xs text-orange-500 font-semibold">${parseFloat(booking.service?.price || 0).toFixed(2)}</p>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">{booking.provider?.name}</td>
                    <td className="px-4 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {new Date(booking.bookingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500 max-w-[140px] truncate">{booking.address}</td>
                    <td className="px-4 py-4">
                      <StatusBadge status={booking.bookingStatus?.status} />
                    </td>
                    <td className="px-4 py-4">
                      <button
                        id={`update-status-${booking.id}`}
                        onClick={() => setSelectedBooking(booking)}
                        className="px-3 py-1.5 rounded-lg bg-orange-50 text-orange-600 text-xs font-semibold hover:bg-orange-100 transition-colors"
                      >
                        ✏️ Status
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {bookings.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <span className="text-4xl">📭</span>
                <p className="mt-2">No bookings found.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {bookings.length} of {pagination.total} bookings
          </p>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="btn-secondary disabled:opacity-50 px-4 py-2 text-sm">← Prev</button>
            <button disabled={page === pagination.totalPages} onClick={() => setPage((p) => p + 1)} className="btn-secondary disabled:opacity-50 px-4 py-2 text-sm">Next →</button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {selectedBooking && (
          <StatusModal
            booking={selectedBooking}
            onClose={() => setSelectedBooking(null)}
            onSave={fetchBookings}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageBookings;
