import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../api/client';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [step, setStep] = useState('email'); // 'email', 'verify' o 'login'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      verifyToken(token);
    }
  }, [token]);

  const verifyToken = async (verifyToken) => {
    try {
      setLoading(true);
      const response = await authAPI.verify(verifyToken);
      localStorage.setItem('token', response.data.token);
      setSuccess('✅ ¡Autenticado! Redirigiendo...');
      setTimeout(() => {
        if (response.data.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/app');
        }
      }, 1500);
    } catch (err) {
      setError('❌ Token inválido o expirado');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMagicLink = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await authAPI.magicLink(email);
      setSuccess('✅ Revisa tu email para el link de acceso');
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al enviar el email');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.login(email, password);
      localStorage.setItem('token', response.data.token);
      setSuccess('✅ ¡Autenticado! Redirigiendo...');
      setTimeout(() => {
        if (response.data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/app');
        }
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-900/20 to-gray-950 flex items-center justify-center p-4">
      {/* Background stars */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.3,
              animation: `twinkle ${Math.random() * 3 + 2}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Auth Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-gray-900/80 border border-purple-500/20 rounded-xl p-8 backdrop-blur-xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="text-4xl mb-3">⭐</div>
            <h1 className="text-2xl font-bold text-white mb-2">FamilyStars</h1>
            <p className="text-gray-400 text-sm">Tu árbol genealógico como constelación</p>
          </div>

          {/* Verificando token automáticamente */}
          {token && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin">
                <div className="text-4xl">⏳</div>
              </div>
              <p className="text-gray-300 mt-4 font-medium">Verificando acceso...</p>
            </div>
          )}

          {/* Tabs */}
          {!token && (
            <div className="space-y-4">
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => {
                    setStep('email');
                    setError(null);
                    setSuccess(null);
                  }}
                  className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                    step === 'email'
                      ? 'bg-purple-700 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Magic Link
                </button>
                <button
                  onClick={() => {
                    setStep('login');
                    setError(null);
                    setSuccess(null);
                  }}
                  className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                    step === 'login'
                      ? 'bg-purple-700 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Login
                </button>
              </div>

              {/* Magic Link Form */}
              {step === 'email' && (
                <form onSubmit={handleSendMagicLink} className="space-y-4">
                  <div>
                    <label className="text-gray-300 text-sm font-medium block mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      required
                      disabled={loading}
                      className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-semibold py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Enviando...' : 'Recibir link de acceso'}
                  </button>
                </form>
              )}

              {/* Login Form */}
              {step === 'login' && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="text-gray-300 text-sm font-medium block mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      required
                      disabled={loading}
                      className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="text-gray-300 text-sm font-medium block mb-2">
                      Contraseña
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="admin123"
                      required
                      disabled={loading}
                      className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-semibold py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Iniciando sesión...' : 'Entrar'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Messages */}
          {error && (
            <div className="mt-4 p-3 bg-red-900/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-4 p-3 bg-green-900/20 border border-green-500/50 rounded-lg text-green-400 text-sm">
              {success}
            </div>
          )}

          {/* Info */}
          {!token && !success && (
            <div className="mt-6 p-4 bg-purple-900/20 border border-purple-500/20 rounded-lg">
              <p className="text-gray-300 text-sm text-center">
                Ingresa tu email y recibirás un link mágico para acceder sin contraseña.
              </p>
            </div>
          )}

          {/* Back to home */}
          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
            >
              ← Volver al inicio
            </a>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
