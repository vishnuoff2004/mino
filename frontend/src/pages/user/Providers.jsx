import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import useDebounce from '../../hooks/useDebounce';
import { useTranslation } from 'react-i18next';
import { tl } from '../../utils/translate';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import SkeletonCard from '../../components/common/SkeletonCard';
import toast from 'react-hot-toast';

const Providers = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const service = location.state?.service;

  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const debouncedSearch = useDebounce(search, 400);
  const lang = i18n.language;

  useEffect(() => {
    if (!service) {
      navigate('/services');
      return;
    }
    const fetchProviders = async () => {
      setLoading(true);
      try {
        const res = await api.get('/providers', {
          params: {
            skill_type: service.name,
            search: debouncedSearch,
            limit: 20,
          },
        });
        setProviders(res.data.providers);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProviders();
  }, [service, debouncedSearch]);

  const handleConfirmBooking = async () => {
    if (!selectedProvider) return toast.error(t('providers.error_select'));
    if (!bookingDate) return toast.error(t('providers.error_date'));
    if (!address.trim()) return toast.error(t('providers.error_address'));

    const today = new Date().toISOString().split('T')[0];
    if (bookingDate < today) return toast.error(t('providers.error_future'));

    setSubmitting(true);
    try {
      await api.post('/bookings', {
        serviceId: service.id,
        providerId: selectedProvider.id,
        bookingDate,
        address,
      });
      navigate('/bookings', { state: { success: true } });
      toast.success(t('providers.confirmed'));
    } catch (err) {
      toast.error(err.response?.data?.message || t('error.booking_failed'));
    } finally {
      setSubmitting(false);
    }
  };

  if (!service) return null;

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl hover:bg-cream-100 text-gray-600 transition-colors"
        >
          ←
        </button>
        <div>
          <h1 className="page-title">{t('providers.title')}</h1>
          <p className="section-subtitle">
            {t('providers.service_label')} <strong className="text-orange-600">{tl(service, 'name', lang, t)}</strong> · ${parseFloat(service.price).toFixed(2)} · {service.duration}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        <input
          id="providers-search"
          type="text"
          placeholder={t('providers.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-12"
        />
      </div>

      {/* Providers grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard count={6} />
        </div>
      ) : providers.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-6xl">👷</span>
          <p className="mt-4 text-xl font-semibold text-gray-700">{t('providers.none_found')}</p>
          <p className="text-gray-500">{t('providers.none_found_desc')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map((provider, i) => (
            <motion.div
              key={provider.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() =>
                provider.availabilitystatus === 'available' &&
                setSelectedProvider(selectedProvider?.id === provider.id ? null : provider)
              }
              className={`card cursor-pointer transition-all duration-200 border-2 ${
                selectedProvider?.id === provider.id
                  ? 'border-orange-400 bg-orange-50 shadow-card-hover'
                  : provider.availabilitystatus === 'not_available'
                  ? 'opacity-60 cursor-not-allowed border-transparent'
                  : 'border-transparent hover:border-orange-200 hover:shadow-card-hover'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-200 to-purple-200 flex items-center justify-center text-2xl">
                  👷
                </div>
                <StatusBadge status={provider.availabilitystatus} />
              </div>
              <h3 className="font-bold text-gray-800">{tl(provider, 'name', lang, t)}</h3>
              <p className="text-sm text-gray-500 mt-1">🔧 {tl(provider, 'skill_type', lang, t)}</p>
              <p className="text-sm text-gray-500">📞 {provider.phoneno}</p>
              {selectedProvider?.id === provider.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="mt-3 text-orange-500 font-semibold text-sm"
                >
                  {t('providers.selected')}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Booking form */}
      {selectedProvider && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50"
        >
          <h2 className="text-lg font-bold text-gray-800 mb-4">{t('providers.booking_heading')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="booking-date" className="label">{t('providers.booking_date')}</label>
              <input
                id="booking-date"
                type="date"
                min={today}
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label htmlFor="booking-address" className="label">{t('providers.address_label')}</label>
              <input
                id="booking-address"
                type="text"
                placeholder={t('providers.address_placeholder')}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div className="mt-4 p-4 bg-white rounded-xl border border-cream-200">
            <p className="font-semibold text-gray-800 mb-2">{t('providers.summary')}</p>
            <div className="space-y-1 text-sm text-gray-600">
              <p>{t('providers.summary_service')} <strong>{tl(service, 'name', lang, t)}</strong></p>
              <p>{t('providers.summary_provider')} <strong>{tl(selectedProvider, 'name', lang, t)}</strong></p>
              <p>{t('providers.summary_price')} <strong className="text-orange-600">${parseFloat(service.price).toFixed(2)}</strong></p>
              <p>{t('providers.summary_duration')} <strong>{service.duration}</strong></p>
            </div>
          </div>

          <button
            id="confirm-booking-btn"
            onClick={handleConfirmBooking}
            disabled={submitting}
            className="btn-primary w-full mt-4 text-base py-3"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <LoadingSpinner size="sm" />
                {t('providers.confirming')}
              </span>
            ) : (
              t('providers.confirm_btn')
            )}
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default Providers;
