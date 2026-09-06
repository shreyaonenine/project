import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/Login';
import { RegisterPage } from './pages/Register';
import { SchemeBuilder } from './pages/admin/SchemeBuilder';
import { ApplyPage } from './pages/user/Apply';
import { ReviewQueue } from './pages/gov/ReviewQueue';

function Navigation() {
  const { role, token, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="border-b border-zinc-200 px-8 py-4 flex justify-between items-center bg-white sticky top-0 z-50">
      <Link to="/" className="font-bold tracking-tight text-lg text-black">
        Industrial Portal
      </Link>
      <nav className="flex items-center gap-6 text-sm font-medium">
        <Link to="/" className="hover:text-zinc-600 transition-colors">All Schemes</Link>

        {role === 'admin' && (
          <Link to="/admin" className="hover:text-zinc-600 font-semibold text-black transition-colors">
            Admin Panel
          </Link>
        )}

        {(role === 'gov_employee' || role === 'admin') && (
          <Link to="/gov" className="hover:text-zinc-600 font-semibold text-black transition-colors">
            Gov Review
          </Link>
        )}

        {!token ? (
          <div className="flex items-center gap-3">
            <Link to="/login" className="hover:text-zinc-600 transition-colors">Login</Link>
            <Link to="/register" className="bg-black text-white px-3 py-1.5 rounded text-xs hover:bg-zinc-800 transition-colors">
              Sign Up
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase font-mono px-2 py-1 bg-zinc-100 border border-zinc-200 rounded text-zinc-700">
              {role}
            </span>
            <button
              onClick={handleLogout}
              className="border border-zinc-300 text-xs px-3 py-1.5 rounded hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              Logout
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-white text-zinc-900 font-sans">
          <Navigation />
          <main>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Admin Only Route */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <SchemeBuilder />
                  </ProtectedRoute>
                }
              />

              {/* Gov Review Queue (Admin & Gov Employees only) */}
              <Route
                path="/gov"
                element={
                  <ProtectedRoute allowedRoles={['gov_employee', 'admin']}>
                    <ReviewQueue />
                  </ProtectedRoute>
                }
              />

              {/* User Application Form (Requires any logged-in user) */}
              <Route
                path="/apply/:schemeId"
                element={
                  <ProtectedRoute allowedRoles={['user', 'admin', 'gov_employee']}>
                    <ApplyPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}