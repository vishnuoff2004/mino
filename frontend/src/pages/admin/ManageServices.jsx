import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { SkeletonTable } from '../../components/common/SkeletonCard';

const schema = yup.object({
  name: yup.string().min(2).required('Name is required'),
  description: yup.string().min(10).required('Description is required'),
  price: yup.number().positive('Price must be positive').required('Price is required'),
  duration: yup.string().required('Duration is required'),
});

const ServiceModal = ({ service, onClose, onSave }) => {
  const isEdit = !!service;
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: service || {},
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (isEdit) {
        await api.put(`/services/${service.id}`, data);
        toast.success('Service updated successfully!');
      } else {
        await api.post('/services', data);
        toast.success('Service created successfully!');
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
          {isEdit ? '✏️ Edit Service' : '➕ Add Service'}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Service Name</label>
            <input placeholder="e.g. Home Cleaning" className={`input-field ${errors.name ? 'border-red-400' : ''}`} {...register('name')} />
            {errors.name && <p className="error-text">{errors.name.message}</p>}
          </div>
          <div>
            <label className="label">Description</label>
            <textarea rows={3} placeholder="Describe the service..." className={`input-field resize-none ${errors.description ? 'border-red-400' : ''}`} {...register('description')} />
            {errors.description && <p className="error-text">{errors.description.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Price ($)</label>
              <input type="number" step="0.01" placeholder="49.99" className={`input-field ${errors.price ? 'border-red-400' : ''}`} {...register('price')} />
              {errors.price && <p className="error-text">{errors.price.message}</p>}
            </div>
            <div>
              <label className="label">Duration</label>
              <input placeholder="e.g. 2 hours" className={`input-field ${errors.duration ? 'border-red-400' : ''}`} {...register('duration')} />
              {errors.duration && <p className="error-text">{errors.duration.message}</p>}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1">
              {submitting ? <LoadingSpinner size="sm" /> : isEdit ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

const ManageServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editService, setEditService] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await api.get('/services', { params: { page, limit: 8 } });
      setServices(res.data.services);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchServices(); }, [page]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/services/${id}`);
      toast.success('Service deleted.');
      fetchServices();
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
          <h1 className="page-title">Manage Services</h1>
          <p className="section-subtitle">Create, edit and delete services</p>
        </div>
        <button id="add-service-btn" onClick={() => { setEditService(null); setModalOpen(true); }} className="btn-primary">
          + Add Service
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
                  {['#', 'Name', 'Description', 'Price', 'Duration', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {services.map((service, i) => (
                  <motion.tr key={service.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }} className="hover:bg-cream-50 transition-colors">
                    <td className="px-4 py-4 text-sm text-gray-400 font-mono">#{service.id}</td>
                    <td className="px-4 py-4 font-semibold text-gray-800">{service.name}</td>
                    <td className="px-4 py-4 text-sm text-gray-500 max-w-[200px] truncate">{service.description}</td>
                    <td className="px-4 py-4 text-sm font-bold text-orange-600">${parseFloat(service.price).toFixed(2)}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{service.duration}</td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <button
                          id={`edit-service-${service.id}`}
                          onClick={() => { setEditService(service); setModalOpen(true); }}
                          className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-semibold hover:bg-blue-100 transition-colors"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          id={`delete-service-${service.id}`}
                          onClick={() => handleDelete(service.id)}
                          disabled={deletingId === service.id}
                          className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors disabled:opacity-60"
                        >
                          {deletingId === service.id ? <LoadingSpinner size="sm" /> : '🗑️ Delete'}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {services.length === 0 && (
              <div className="text-center py-10 text-gray-500">No services found.</div>
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
          <ServiceModal
            service={editService}
            onClose={() => { setModalOpen(false); setEditService(null); }}
            onSave={fetchServices}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageServices;
