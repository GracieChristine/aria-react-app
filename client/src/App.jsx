import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import { useAuth } from './hooks/useAuth';
import DevSeedWidget from './dev/DevSeedWidget';

// Pages
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/user/ProfilePage';
import CreateListingPage from './pages/host/CreateListingPage';
import HostDashboardPage from './pages/host/HostDashboardPage';
import EditListingPage from './pages/host/EditListingPage';

function AppRoutes() {
  const { user } = useAuth();
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/host/listings/new" element={<CreateListingPage />} />
        <Route path="/host/listings/:id/edit" element={<EditListingPage />} />
        <Route path="/host/dashboard" element={<HostDashboardPage />} />
      </Routes>
      {user?.role === 'host' && <DevSeedWidget />}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
