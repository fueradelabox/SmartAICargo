
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { APP_NAME, APP_SUBTITLE } from '../constants';
import { LockIcon, UsersIcon } from '../components/icons';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!username || !password) {
        setError("Por favor, ingrese usuario y contraseña.");
        return;
    }
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido al iniciar sesión.');
      console.error(err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#121416] p-4">
      <div className="w-full max-w-md">
         <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
                {APP_NAME}
            </h1>
            <p className="text-base text-[#a2abb3] mt-2">{APP_SUBTITLE}</p>
        </div>
        <div className="bg-[#1a1f25] border border-[#40474f] shadow-lg rounded-xl p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-center text-white mb-6">Iniciar Sesión</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-[#a2abb3]">
                Usuario
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UsersIcon className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-[#40474f] rounded-md shadow-sm focus:outline-none focus:ring-[#3f7fbf] focus:border-[#3f7fbf] sm:text-sm bg-[#1f2328] text-white placeholder-[#a2abb3]/70"
                  placeholder="admin, shipper, o carrier"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#a2abb3]">
                Contraseña
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockIcon className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-[#40474f] rounded-md shadow-sm focus:outline-none focus:ring-[#3f7fbf] focus:border-[#3f7fbf] sm:text-sm bg-[#1f2328] text-white placeholder-[#a2abb3]/70"
                  placeholder="password123"
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-400 bg-red-500/10 p-2 rounded-md border border-red-500/20">{error}</p>}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-[#3f7fbf] hover:bg-[#3f7fbf]/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3f7fbf] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[#a2abb3]">
              ¿No tienes una cuenta?{' '}
              <Link to="/register" className="font-medium text-blue-400 hover:text-blue-300">
                Regístrate aquí
              </Link>
            </p>
             <p className="text-xs text-gray-500 mt-4">
              <Link to="/" className="hover:underline">Volver al Inicio</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
