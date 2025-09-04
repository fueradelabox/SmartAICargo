
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { NAV_ITEMS, APP_NAME, APP_SUBTITLE } from '../constants';
import NavItem from './NavItem';
import { useAuth } from '../contexts/AuthContext';
import { 
  HouseIcon, PackageIconPhosphor, TruckIconPhosphor, BellIcon, ChartLineIcon, GearIcon, ClosePhosphorIcon, DashboardIcon, SignOutIcon, UserCircleIcon
} from './icons';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const iconMap: { [key: string]: React.FC<React.SVGProps<SVGSVGElement>> } = {
  HouseIcon,
  PackageIconPhosphor,
  TruckIconPhosphor,
  BellIcon,
  ChartLineIcon,
  GearIcon,
  DashboardIcon,
};

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const isHomePage = location.pathname === '/';
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const visibleNavItems = NAV_ITEMS.filter(item => {
    if (!currentUser) return item.allowedRoles.includes('Guest');
    return item.allowedRoles.includes(currentUser.role);
  });

  const sidebarContent = (isMobile: boolean) => (
    <div className="flex flex-col flex-1 h-full bg-[#121416] p-4">
      {isMobile && (
        <div className="absolute top-2 right-2 sm:-mr-10">
          <button
            type="button"
            className="ml-1 flex items-center justify-center h-12 w-12 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            onClick={() => setSidebarOpen(false)}
            aria-label="Cerrar barra lateral"
          >
            <ClosePhosphorIcon className="h-7 w-7 text-white" />
          </button>
        </div>
      )}
      <div className="flex flex-col mb-4 pt-8 md:pt-0">
        <h1 className="text-white text-base font-medium leading-normal">{APP_NAME}</h1>
        <p className="text-[#a2abb3] text-sm font-normal leading-normal">{APP_SUBTITLE}</p>
      </div>
      <nav className="flex flex-col gap-2 flex-grow">
        {visibleNavItems.map((item) => {
          const IconComponent = iconMap[item.icon] || HouseIcon;
          return (
            <NavItem
              key={item.name}
              to={item.path}
              icon={React.createElement(IconComponent, { className: "text-white h-5 w-5 md:h-6 md:w-6" })}
              isActive={location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))}
              onClick={isMobile ? () => setSidebarOpen(false) : undefined}
            >
              {item.name}
            </NavItem>
          );
        })}
      </nav>
      
      {currentUser && (
        <div className="mt-auto pt-4 border-t border-[#40474f]">
          <div className="flex items-center gap-3">
            <img src={currentUser.avatarUrl} alt={currentUser.name} className="h-10 w-10 rounded-full" />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{currentUser.name}</p>
                <p className="text-xs text-[#a2abb3] truncate">{currentUser.role} @ {currentUser.companyName}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-[#a2abb3] hover:text-white hover:bg-[#2c3035] rounded-full transition-colors"
              aria-label="Cerrar sesión"
            >
              <SignOutIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );


  return (
    <>
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-40 flex md:hidden transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
      >
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" onClick={() => setSidebarOpen(false)}></div>
        
        <div className="relative flex-1 flex flex-col max-w-xs w-full">
         {sidebarContent(true)}
        </div>
        <div className="flex-shrink-0 w-14" aria-hidden="true"></div>
      </div>

      {/* Static sidebar for desktop */}
      <div className={`hidden ${currentUser ? 'md:flex' : ''} md:flex-shrink-0`}>
        <div className="flex flex-col w-72 lg:w-80">
          {sidebarContent(false)}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
