import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import FeedPage from './pages/FeedPage';
import RequestsPage from './pages/RequestsPage';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';
import PublicProfilePage from './pages/PublicProfilePage';

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/" replace />;
  if (adminOnly && !user.isAdmin) return <Navigate to="/feed" replace />;
  if (!adminOnly && user.isAdmin) return <Navigate to="/admin" replace />;
  return children;
}

import ParticleBackground from './components/ParticleBackground';

function AppRoutes() {
  const { user } = useAuth();
  return (
    <>
      <ParticleBackground />
      {/* Only show navbar on non-chat pages */}
      <Routes>
        <Route path="/chat/:requestId" element={null} />
        <Route path="*" element={<Navbar />} />
      </Routes>

      <Routes>
        <Route path="/" element={user ? <Navigate to={user.isAdmin ? '/admin' : '/feed'} /> : <LoginPage />} />
        <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
        <Route path="/feed" element={<ProtectedRoute><FeedPage /></ProtectedRoute>} />
        <Route path="/requests" element={<ProtectedRoute><RequestsPage /></ProtectedRoute>} />
        <Route path="/chat/:requestId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/user/:userId" element={<ProtectedRoute><PublicProfilePage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1A1020',
              color: '#FFE0B2',
              border: '1px solid rgba(255,224,178,0.15)',
              fontFamily: 'Poppins, sans-serif',
            },
            success: { iconTheme: { primary: '#FF6F00', secondary: '#fff' } },
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
