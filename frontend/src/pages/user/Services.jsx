import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import useDebounce from '../../hooks/useDebounce';
import SkeletonCard from '../../components/common/SkeletonCard';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 400);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const res = await api.get('/services', {
          params: { search: debouncedSearch, page, limit: 6 },
        });
        setServices(res.data.services);
        setPagination(res.data.pagination);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, [debouncedSearch, page]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const handleBookNow = (service) => {
    navigate('/providers', { state: { service } });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="page-title">Our Services</h1>
        <p className="section-subtitle">Find the perfect service for your needs</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md border-2 border-amber-300 rounded-md ">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
        <input
          id="services-search"
          type="text"
          placeholder="Search services..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="inp pl-12 ml-9 bg-transparent"
          style={{border:'none'}}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg"
          >
            ×
          </button>
        )}
      </div>

      {/* Services grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard count={6} />
        </div>
      ) : services.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
          <span className="text-6xl">🔍</span>
          <p className="mt-4 text-xl font-semibold text-gray-700">No services found</p>
          <p className="text-gray-500 mt-1">Try a different search term</p>
          <button onClick={() => setSearch('')} className="btn-secondary mt-4">
            Clear search
          </button>
        </motion.div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card-hover flex flex-col"
              >
                {/* Service icon */}
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-200 to-amber-200 flex items-center justify-center text-2xl mb-4">
                  🛠️
                </div>

                <h3 className="text-lg font-bold text-gray-800 mb-2">{service.name}</h3>
                <p className="text-gray-500 text-sm flex-1 line-clamp-3">{service.description}</p>

                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-orange-500">
                      ${parseFloat(service.price).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      ⏱️ {service.duration}
                    </p>
                  </div>
                </div>

                <button
                  id={`book-service-${service.id}`}
                  onClick={() => handleBookNow(service)}
                  className="btn-primary w-full mt-4"
                >
                  Book Now
                </button>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="btn-secondary disabled:opacity-50 px-4 py-2"
              >
                ←
              </button>
              <span className="text-sm text-gray-600 font-medium px-4">
                Page {page} of {pagination.totalPages}
              </span>
              <button
                disabled={page === pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="btn-secondary disabled:opacity-50 px-4 py-2"
              >
                →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Services;
