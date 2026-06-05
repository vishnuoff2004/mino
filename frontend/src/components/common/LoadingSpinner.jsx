const LoadingSpinner = ({ size = 'md', text = '' }) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-3',
    xl: 'w-16 h-16 border-4',
  };

  return (
    <div className="flex items-center justify-center gap-3">
      <div
        className={`${sizes[size]} rounded-full border-orange-200 border-t-orange-500 animate-spin`}
      />
      {text && <span className="text-gray-500 text-sm font-medium">{text}</span>}
    </div>
  );
};

export default LoadingSpinner;
