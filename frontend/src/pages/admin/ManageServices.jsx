import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { tl } from '../../utils/translate';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { SkeletonTable } from '../../components/common/SkeletonCard';

const ServiceModal = ({ service, onClose, onSave }) => {
  const { t } = useTranslation();
  const isEdit = !!service;
  const [submitting, setSubmitting] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);

  const schema = useMemo(() => yup.object({
    name: yup.string().min(2).required(t('validation.name_required_admin')),
    description: yup.string().min(10).required(t('validation.description_required')),
    price: yup.number().positive(t('validation.price_positive')).required(t('validation.price_required')),
    duration: yup.string().required(t('validation.duration_required')),
  }), [t]);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: service || {},
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('price', data.price);
      formData.append('duration', data.duration);
      if (pdfFile) {
        formData.append('document', pdfFile);
      }

      const config = { headers: { 'Content-Type': 'multipart/form-data' } };

      if (isEdit) {
        await api.put(`/services/${service.id}`, formData, config);
        toast.success(t('admin.services.updated'));
      } else {
        await api.post('/services', formData, config);
        toast.success(t('admin.services.created'));
      }
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
        className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-xl font-bold text-gray-800 mb-5">
          {isEdit ? t('admin.services.modal_edit') : t('admin.services.modal_add')}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">{t('admin.services.field_name')}</label>
            <input placeholder={t('admin.services.field_name_placeholder')} className={`input-field ${errors.name ? 'border-red-400' : ''}`} {...register('name')} />
            {errors.name && <p className="error-text">{errors.name.message}</p>}
          </div>

          <div>
            <label className="label">{t('admin.services.field_description')}</label>
            <textarea rows={3} placeholder={t('admin.services.field_description_placeholder')} className={`input-field resize-none ${errors.description ? 'border-red-400' : ''}`} {...register('description')} />
            {errors.description && <p className="error-text">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">{t('admin.services.field_price')}</label>
              <input type="number" step="0.01" placeholder={t('admin.services.field_price_placeholder')} className={`input-field ${errors.price ? 'border-red-400' : ''}`} {...register('price')} />
              {errors.price && <p className="error-text">{errors.price.message}</p>}
            </div>
            <div>
              <label className="label">{t('admin.services.field_duration')}</label>
              <input placeholder={t('admin.services.field_duration_placeholder')} className={`input-field ${errors.duration ? 'border-red-400' : ''}`} {...register('duration')} />
              {errors.duration && <p className="error-text">{errors.duration.message}</p>}
            </div>
          </div>
          <div>
            <label className="label">{t('admin.services.field_document')}</label>
            <input
              type="file"
              accept=".pdf,application/pdf"
              className="input-field file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-purple-50 file:text-purple-700 file:text-sm file:font-semibold hover:file:bg-purple-100"
              onChange={(e) => setPdfFile(e.target.files[0])}
            />
            {service?.document_url && (
              <p className="text-xs text-gray-400 mt-1">
                {t('admin.services.field_current')}{' '}
                <a href={service.document_url} target="_blank" rel="noopener noreferrer" className="text-purple-600 underline">
                  {service.document_url.split('/').pop()}
                </a>
              </p>
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">{t('admin.services.cancel')}</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1">
              {submitting ? <LoadingSpinner size="sm" /> : isEdit ? t('admin.services.update') : t('admin.services.create')}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

const ManageServices = () => {
  const { t, i18n } = useTranslation();
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
    if (!window.confirm(t('admin.services.confirm_delete'))) return;
    setDeletingId(id);
    try {
      await api.delete(`/services/${id}`);
      toast.success(t('admin.services.deleted'));
      fetchServices();
    } catch (err) {
      toast.error(err.response?.data?.message || t('error.delete_failed'));
    } finally {
      setDeletingId(null);
    }
  };

  const lang = i18n.language;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">{t('admin.services.title')}</h1>
          <p className="section-subtitle">{t('admin.services.subtitle')}</p>
        </div>
        <button id="add-service-btn" onClick={() => { setEditService(null); setModalOpen(true); }} className="btn-primary">
          {t('admin.services.add_btn')}
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
                  {[t('admin.services.table_id'), t('admin.services.table_name'), t('admin.services.table_description'), t('admin.services.table_price'), t('admin.services.table_duration'), t('admin.services.table_document'), t('admin.services.table_actions')].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {services.map((service, i) => (
                  <motion.tr key={service.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }} className="hover:bg-cream-50 transition-colors">
                    <td className="px-4 py-4 text-sm text-gray-400 font-mono">#{service.id}</td>
                    <td className="px-4 py-4 font-semibold text-gray-800">{tl(service, 'name', lang, t)}</td>
                    <td className="px-4 py-4 text-sm text-gray-500 max-w-[200px] truncate">{tl(service, 'description', lang, t)}</td>
                    <td className="px-4 py-4 text-sm font-bold text-orange-600">${parseFloat(service.price).toFixed(2)}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{service.duration}</td>
                    <td className="px-4 py-4 text-sm">
                      {service.document_url ? (
                        <a href={service.document_url} target="_blank" rel="noopener noreferrer" className="text-purple-600 underline hover:text-purple-800">
                          {t('admin.services.view_pdf')}
                        </a>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <button
                          id={`edit-service-${service.id}`}
                          onClick={() => { setEditService(service); setModalOpen(true); }}
                          className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-semibold hover:bg-blue-100 transition-colors"
                        >
                          {t('admin.services.edit')}
                        </button>
                        <button
                          id={`delete-service-${service.id}`}
                          onClick={() => handleDelete(service.id)}
                          disabled={deletingId === service.id}
                          className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors disabled:opacity-60"
                        >
                          {deletingId === service.id ? <LoadingSpinner size="sm" /> : t('admin.services.delete')}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {services.length === 0 && (
              <div className="text-center py-10 text-gray-500">{t('admin.services.none')}</div>
            )}
          </div>
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">{t('services.page_info', { page, totalPages: pagination.totalPages })}</p>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="btn-secondary disabled:opacity-50 px-4 py-2 text-sm">{t('admin.services.prev')}</button>
            <button disabled={page === pagination.totalPages} onClick={() => setPage((p) => p + 1)} className="btn-secondary disabled:opacity-50 px-4 py-2 text-sm">{t('admin.services.next')}</button>
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
