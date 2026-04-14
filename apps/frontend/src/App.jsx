import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Landing from './pages/Landing';
import Constellation from './pages/Constellation';
import Admin from './pages/Admin';
import Auth from './pages/Auth';
import PasswordGate from './pages/PasswordGate';
import { authAPI } from './api/client';
import './styles/index.css';

function AdminRoute() {
  const [isAuthorized, setIsAuthorized] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsAuthorized(false);
        return;
      }

      try {
        const response = await authAPI.me();
        if (response.data?.role === 'admin') {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
        }
      } catch {
        setIsAuthorized(false);
      }
    };

    checkAuth();
  }, []);

  if (isAuthorized === null) {
    return (
      <div className="h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin">
          <p className="text-white">⏳ Verificando acceso...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) return <Navigate to="/" />;
  return <Admin />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route
          path="/app"
          element={
            <PasswordGate>
              <Constellation />
            </PasswordGate>
          }
        />
        <Route path="/admin" element={<AdminRoute />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
