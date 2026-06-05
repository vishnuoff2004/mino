const SkeletonCard = ({ count = 6 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card animate-pulse">
          <div className="skeleton h-5 w-3/4 mb-3" />
          <div className="skeleton h-3 w-full mb-2" />
          <div className="skeleton h-3 w-5/6 mb-4" />
          <div className="flex gap-3">
            <div className="skeleton h-7 w-20" />
            <div className="skeleton h-7 w-20" />
          </div>
          <div className="skeleton h-10 w-full mt-4 rounded-xl" />
        </div>
      ))}
    </>
  );
};

export const SkeletonTable = ({ rows = 5 }) => {
  return (
    <div className="card">
      <div className="skeleton h-6 w-48 mb-6" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 mb-4 animate-pulse">
          <div className="skeleton h-5 w-8" />
          <div className="skeleton h-5 flex-1" />
          <div className="skeleton h-5 w-24" />
          <div className="skeleton h-5 w-20" />
          <div className="skeleton h-5 w-24" />
        </div>
      ))}
    </div>
  );
};

export default SkeletonCard;
