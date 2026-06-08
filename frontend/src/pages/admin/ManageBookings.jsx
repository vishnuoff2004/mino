import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { tl } from '../../utils/translate';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { SkeletonTable } from '../../components/common/SkeletonCard';

const StatusModal = ({ booking, onClose, onSave }) => {
  const { t } = useTranslation();
  const [selectedStatus, setSelectedStatus] = useState(booking.bookingStatusId);
  const [submitting, setSubmitting] = useState(false);

  const STATUS_OPTIONS = [
    { id: 1, label: t('status.pending'), value: 'pending' },
    { id: 2, label: t('status.confirmed'), value: 'confirmed' },
    { id: 3, label: t('status.completed'), value: 'completed' },
    { id: 4, label: t('status.cancelled'), value: 'cancelled' },
  ];

  const handleUpdate = async () => {
    setSubmitting(true);
    try {
      await api.put(`/admin/bookings/${booking.id}/status`, { bookingStatusId: selectedStatus });
      toast.success(t('admin.bookings.updated'));
      onSave();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || t('error.operation_failed'));
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
        <h2 className="text-xl font-bold text-gray-800 mb-2">{t('admin.bookings.modal_title')}</h2>
        <p className="text-sm text-gray-500 mb-5">
          {t('admin.bookings.modal_booking')} #{booking.id} · {booking.user?.name}
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
          <button onClick={onClose} className="btn-secondary flex-1">{t('admin.bookings.cancel')}</button>
          <button onClick={handleUpdate} disabled={submitting} className="btn-primary flex-1">
            {submitting ? <LoadingSpinner size="sm" /> : t('admin.bookings.update_btn')}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const ManageBookings = () => {
  const { t, i18n } = useTranslation();
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

  const lang = i18n.language;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">{t('admin.bookings.title')}</h1>
        <p className="section-subtitle">{t('admin.bookings.subtitle')}</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {[{key: '', label: t('admin.bookings.filter_all')}, {key: 'pending', label: t('admin.bookings.filter_pending')}, {key: 'confirmed', label: t('admin.bookings.filter_confirmed')}, {key: 'completed', label: t('admin.bookings.filter_completed')}, {key: 'cancelled', label: t('admin.bookings.filter_cancelled')}].map(({key, label}) => (
          <button
            key={key}
            id={`filter-${key || 'all'}`}
            onClick={() => setStatusFilter(key)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              statusFilter === key
                ? 'bg-gradient-to-r from-orange-400 to-pink-400 text-white shadow-md'
                : 'bg-white text-gray-600 border border-cream-200 hover:border-orange-300'
            }`}
          >
            {label}
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
                  {[t('admin.bookings.table_id'), t('admin.bookings.table_customer'), t('admin.bookings.table_service'), t('admin.bookings.table_provider'), t('admin.bookings.table_date'), t('admin.bookings.table_address'), t('admin.bookings.table_status'), t('admin.bookings.table_action')].map((h) => (
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
                      <p className="font-medium text-gray-700">{tl(booking.service, 'name', lang, t)}</p>
                      <p className="text-xs text-orange-500 font-semibold">${parseFloat(booking.service?.price || 0).toFixed(2)}</p>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">{tl(booking.provider, 'name', lang, t)}</td>
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
                        {t('admin.bookings.status_btn')}
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {bookings.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <span className="text-4xl">📭</span>
                <p className="mt-2">{t('admin.bookings.none')}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {t('admin.bookings.showing', { count: bookings.length, total: pagination.total })}
          </p>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="btn-secondary disabled:opacity-50 px-4 py-2 text-sm">{t('admin.bookings.prev')}</button>
            <button disabled={page === pagination.totalPages} onClick={() => setPage((p) => p + 1)} className="btn-secondary disabled:opacity-50 px-4 py-2 text-sm">{t('admin.bookings.next')}</button>
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
