const StatusBadge = ({ status }) => {
  const statusMap = {
    pending: 'badge-pending',
    confirmed: 'badge-confirmed',
    completed: 'badge-completed',
    cancelled: 'badge-cancelled',
    available: 'badge-available',
    not_available: 'badge-not_available',
  };

  const labelMap = {
    pending: '⏳ Pending',
    confirmed: '✅ Confirmed',
    completed: '🎉 Completed',
    cancelled: '❌ Cancelled',
    available: '🟢 Available',
    not_available: '🔴 Not Available',
  };

  const cls = statusMap[status] || 'badge bg-gray-100 text-gray-700';
  const label = labelMap[status] || status;

  return <span className={cls}>{label}</span>;
};

export default StatusBadge;
