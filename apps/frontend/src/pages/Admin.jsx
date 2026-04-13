import { useEffect, useState } from 'react';
import { authAPI } from '../api/client';
import AdminLayout from '../components/admin/AdminLayout';

export default function Admin() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await authAPI.me();
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin">
          <p className="text-white text-lg">⏳ Cargando...</p>
        </div>
      </div>
    );
  }

  return <AdminLayout user={user} />;
}
