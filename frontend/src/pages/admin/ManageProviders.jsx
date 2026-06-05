import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import { SkeletonTable } from '../../components/common/SkeletonCard';

const schema = yup.object({
  name: yup.string().min(2).required('Name is required'),
  skill_type: yup.string().required('Skill type is required'),
  phoneno: yup.string().min(7).required('Phone number is required'),
  availabilitystatus: yup.string().oneOf(['available', 'not_available']).required(),
});

const ProviderModal = ({ provider, onClose, onSave }) => {
  const isEdit = !!provider;
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: provider || { availabilitystatus: 'available' },
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (isEdit) {
        await api.put(`/providers/${provider.id}`, data);
        toast.success('Provider updated!');
      } else {
        await api.post('/providers', data);
        toast.success('Provider added!');
      }
      onSave();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
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
        className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md"
      >
        <h2 className="text-xl font-bold text-gray-800 mb-5">
          {isEdit ? '✏️ Edit Provider' : '➕ Add Provider'}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input placeholder="Provider name" className={`input-field ${errors.name ? 'border-red-400' : ''}`} {...register('name')} />
            {errors.name && <p className="error-text">{errors.name.message}</p>}
          </div>
          <div>
            <label className="label">Skill Type</label>
            <input placeholder="e.g. Home Cleaning" className={`input-field ${errors.skill_type ? 'border-red-400' : ''}`} {...register('skill_type')} />
            {errors.skill_type && <p className="error-text">{errors.skill_type.message}</p>}
          </div>
          <div>
            <label className="label">Phone Number</label>
            <input placeholder="555-0100" className={`input-field ${errors.phoneno ? 'border-red-400' : ''}`} {...register('phoneno')} />
            {errors.phoneno && <p className="error-text">{errors.phoneno.message}</p>}
          </div>
          <div>
            <label className="label">Availability Status</label>
            <select className={`input-field ${errors.availabilitystatus ? 'border-red-400' : ''}`} {...register('availabilitystatus')}>
              <option value="available">🟢 Available</option>
              <option value="not_available">🔴 Not Available</option>
            </select>
            {errors.availabilitystatus && <p className="error-text">{errors.availabilitystatus.message}</p>}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1">
              {submitting ? <LoadingSpinner size="sm" /> : isEdit ? 'Update' : 'Add Provider'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

const ManageProviders = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editProvider, setEditProvider] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/providers', { params: { page, limit: 8 } });
      setProviders(res.data.providers);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProviders(); }, [page]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this provider?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/providers/${id}`);
      toast.success('Provider deleted.');
      fetchProviders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Manage Providers</h1>
          <p className="section-subtitle">Add, edit and manage service providers</p>
        </div>
        <button id="add-provider-btn" onClick={() => { setEditProvider(null); setModalOpen(true); }} className="btn-primary">
          + Add Provider
        </button>
      </div>

      {loading ? (
        <SkeletonTable rows={6} />
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-cream-50 border-b border-cream-200">
                <tr>
                  {['#', 'Name', 'Skill Type', 'Phone', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {providers.map((provider, i) => (
                  <motion.tr key={provider.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }} className="hover:bg-cream-50 transition-colors">
                    <td className="px-4 py-4 text-sm text-gray-400 font-mono">#{provider.id}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-200 to-blue-200 flex items-center justify-center text-sm">👷</div>
                        <span className="font-semibold text-gray-800">{provider.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">{provider.skill_type}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{provider.phoneno}</td>
                    <td className="px-4 py-4">
                      <StatusBadge status={provider.availabilitystatus} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <button
                          id={`edit-provider-${provider.id}`}
                          onClick={() => { setEditProvider(provider); setModalOpen(true); }}
                          className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-semibold hover:bg-blue-100 transition-colors"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          id={`delete-provider-${provider.id}`}
                          onClick={() => handleDelete(provider.id)}
                          disabled={deletingId === provider.id}
                          className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors disabled:opacity-60"
                        >
                          {deletingId === provider.id ? <LoadingSpinner size="sm" /> : '🗑️ Delete'}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {providers.length === 0 && (
              <div className="text-center py-10 text-gray-500">No providers found.</div>
            )}
          </div>
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Page {page} of {pagination.totalPages}</p>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="btn-secondary disabled:opacity-50 px-4 py-2 text-sm">← Prev</button>
            <button disabled={page === pagination.totalPages} onClick={() => setPage((p) => p + 1)} className="btn-secondary disabled:opacity-50 px-4 py-2 text-sm">Next →</button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {modalOpen && (
          <ProviderModal
            provider={editProvider}
            onClose={() => { setModalOpen(false); setEditProvider(null); }}
            onSave={fetchProviders}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageProviders;
