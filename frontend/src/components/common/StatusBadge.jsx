import { useTranslation } from 'react-i18next';

const StatusBadge = ({ status }) => {
  const { t } = useTranslation();

  const statusMap = {
    pending: 'badge-pending',
    confirmed: 'badge-confirmed',
    completed: 'badge-completed',
    cancelled: 'badge-cancelled',
    available: 'badge-available',
    not_available: 'badge-not_available',
  };

  const labelMap = {
    pending: t('status.pending'),
    confirmed: t('status.confirmed'),
    completed: t('status.completed'),
    cancelled: t('status.cancelled'),
    available: t('status.available'),
    not_available: t('status.not_available'),
  };

  const cls = statusMap[status] || 'badge bg-gray-100 text-gray-700';
  const label = labelMap[status] || status;

  return <span className={cls}>{label}</span>;
};

export default StatusBadge;
