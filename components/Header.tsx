
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { NAV_ITEMS, APP_NAME } from '../constants';
import { MenuPhosphorIcon } from './icons';
import { useAuth } from '../contexts/AuthContext';
import NotificationBell from './NotificationBell';

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
}

const getPageDescription = (path: string): string => {
  switch (path) {
    case '/':
      return "Bienvenido a SmartAICargo. Navegue por nuestras soluciones de logística inteligente.";
    case '/dashboard':
      return "Resumen de sus operaciones logísticas.";
    case '/shipments':
      return "Rastrea y gestiona tus envíos en curso.";
    case '/loads':
      return "Coordina y optimiza tus cargas.";
    case '/alerts':
      return "Revisa y gestiona las alertas operativas y del sistema.";
    case '/analytics':
      return "Analiza el rendimiento logístico y las métricas de sostenibilidad.";
    case '/settings':
      return "Configura tu perfil y gestiona las colaboraciones.";
    case '/login':
      return "Inicia sesión para acceder a la plataforma.";
    case '/register':
        return "Crea una nueva cuenta para unirte a la red.";
    default:
      return "Gestiona tus operaciones logísticas de forma eficiente.";
  }
};

const Header: React.FC<HeaderProps> = ({ setSidebarOpen }) => {
  const location = useLocation();
  const { currentUser } = useAuth();
  
  const currentNavItem = NAV_ITEMS.find(item => {
    if (item.path === '/') {
      return location.pathname === '/';
    }
    // Match root paths like /loads for /loads/new
    return location.pathname.startsWith(item.path) && item.path !== '/';
  });

  const pageTitle = currentNavItem ? currentNavItem.name : (location.pathname === '/login' ? 'Iniciar Sesión' : location.pathname === '/register' ? 'Registro' : APP_NAME);
  const pageDescription = getPageDescription(location.pathname);

  return (
    <header className="flex flex-wrap justify-between items-center gap-3 p-3 sm:p-4">
        <div className="flex items-center gap-3">
             {currentUser && (
              <button
                  type="button"
                  className="md:hidden text-white p-2 -ml-2 mobile-tap-target"
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Abrir barra lateral"
              >
                  <MenuPhosphorIcon className="h-6 w-6" />
              </button>
            )}
            <div className="flex flex-col">
                <h1 className="text-white tracking-light text-2xl sm:text-[32px] font-bold leading-tight">{pageTitle}</h1>
                {pageDescription && <p className="text-[#a2abb3] text-xs sm:text-sm font-normal leading-normal">{pageDescription}</p>}
            </div>
        </div>
      
      <div className="flex items-center gap-4">
        {currentUser ? (
          <NotificationBell />
        ) : (
          location.pathname !== '/login' && location.pathname !== '/register' && (
            <div className="flex items-center gap-2">
              <Link to="/login" className="text-sm font-medium text-white bg-[#2c3035] hover:bg-[#40474f] px-4 py-2 rounded-lg transition-colors">
                Iniciar Sesión
              </Link>
              <Link to="/register" className="text-sm font-medium text-white bg-[#3f7fbf] hover:bg-[#3f7fbf]/80 px-4 py-2 rounded-lg transition-colors">
                Registrarse
              </Link>
            </div>
          )
        )}
      </div>
    </header>
  );
};

export default Header;
