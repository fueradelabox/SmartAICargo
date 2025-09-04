
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { NAV_ITEMS, APP_NAME } from '../constants';
import { 
  HouseIcon, PackageIconPhosphor, TruckIconPhosphor, BellIcon, ChartLineIcon, GearIcon, DashboardIcon
} from '../components/icons'; 

// Map icon names from NAV_ITEMS to actual icon components
const iconComponentsMap: { [key: string]: React.FC<React.SVGProps<SVGSVGElement>> } = {
  HouseIcon,
  DashboardIcon, // Added DashboardIcon as it's used by NAV_ITEMS
  PackageIconPhosphor,
  TruckIconPhosphor,
  BellIcon,
  ChartLineIcon,
  GearIcon,
};

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  
  // Updated cardBaseStyle for square buttons and centered content
  const cardBaseStyle = "bg-[#1a1f25] border border-[#40474f] shadow-xl rounded-xl text-white hover:bg-[#2c3035] transition-all duration-300 transform hover:-translate-y-1 cursor-pointer flex flex-col justify-center items-center p-3 sm:p-4 aspect-square mobile-tap-target overflow-hidden";
  
  // Updated titleStyle for better fit in square buttons
  const titleStyle = "text-sm sm:text-base font-bold text-white mb-1 text-center";
  
  // Updated descriptionStyle to limit lines and center
  const descriptionStyle = "text-xs text-[#a2abb3] text-center overflow-hidden leading-tight max-h-10"; // Max height for approx 2 lines of text-xs

  // Updated iconContainerStyle for smaller icons in square buttons
  const iconContainerStyle = "mb-1 sm:mb-2 p-1.5 sm:p-2 rounded-full bg-[#3f7fbf]/20";

  // Filter out the "Inicio" item for the main page grid, but keep it in the sidebar
  const pageNavItems = NAV_ITEMS.filter(item => item.path !== '/');

  return (
    <div className="space-y-8 p-2 sm:p-4">
      <div className="text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Bienvenido a <span className="text-[#3f7fbf]">{APP_NAME}</span>
        </h1>
        <p className="text-base sm:text-lg text-[#a2abb3] max-w-2xl mx-auto">
          Su solución integral para la gestión logística inteligente. Acceda a nuestras herramientas optimizadas por IA para transformar su cadena de suministro.
        </p>
      </div>

      {/* Grid updated for 2 columns on mobile, 3 on md and up */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mt-8">
        {pageNavItems.map((item) => {
          const IconComponent = iconComponentsMap[item.icon] || HouseIcon; // Fallback icon
          return (
            <div
              key={item.name}
              className={cardBaseStyle}
              onClick={() => navigate(item.path)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate(item.path); }}
              aria-label={`Acceder a ${item.name}`}
            >
              <div className={iconContainerStyle}>
                {IconComponent && <IconComponent className="h-6 w-6 sm:h-8 sm:w-8 text-[#3f7fbf]" />}
              </div>
              <h2 className={titleStyle}>{item.name}</h2>
              <p className={descriptionStyle}>
                {item.description || `Accede a la sección de ${item.name.toLowerCase()} para más detalles.`}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HomePage;