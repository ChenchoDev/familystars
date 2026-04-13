import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Constellation from './pages/Constellation';
import Admin from './pages/Admin';
import './styles/index.css';

function AdminRoute() {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/" />;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.role !== 'admin') return <Navigate to="/" />;
    return <Admin />;
  } catch {
    return <Navigate to="/" />;
  }
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<Constellation />} />
        <Route path="/admin" element={<AdminRoute />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
