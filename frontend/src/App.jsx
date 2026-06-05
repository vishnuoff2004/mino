import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

// Route Guards
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';

// Layouts
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyEmail from './pages/auth/VerifyEmail';

// User Pages
import UserDashboard from './pages/user/UserDashboard';
import Services from './pages/user/Services';
import Providers from './pages/user/Providers';
import MyBookings from './pages/user/MyBookings';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageServices from './pages/admin/ManageServices';
import ManageProviders from './pages/admin/ManageProviders';
import ManageBookings from './pages/admin/ManageBookings';

// Other
import Unauthorized from './pages/Unauthorized';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#fff',
              color: '#1a1a2e',
              border: '1px solid #FFECC8',
              borderRadius: '14px',
              fontSize: '14px',
              fontWeight: '500',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            },
            success: {
              iconTheme: { primary: '#22c55e', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />

        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* User Protected Routes */}
          <Route
            element={
              <ProtectedRoute>
                <UserLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/services" element={<Services />} />
            <Route path="/providers" element={<Providers />} />
            <Route path="/bookings" element={<MyBookings />} />
          </Route>

          {/* Admin Protected Routes */}
          <Route
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/services" element={<ManageServices />} />
            <Route path="/admin/providers" element={<ManageProviders />} />
            <Route path="/admin/bookings" element={<ManageBookings />} />
          </Route>

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
