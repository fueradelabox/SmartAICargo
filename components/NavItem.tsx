import React from 'react';
import { Link } from 'react-router-dom';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isActive: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, children, isActive, onClick }) => {
  const activeClass = 'bg-[#2c3035] text-white rounded-xl'; // Active background and rounding from new design
  const inactiveClass = 'text-white hover:bg-[#2c3035]/80 rounded-xl'; // Text is white, hover from new design, consistent rounding

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 md:py-2 transition-colors duration-150 mobile-tap-target ${ // py-2.5 for mobile
        isActive ? activeClass : inactiveClass
      }`}
    >
      {icon} 
      <p className="text-sm md:text-base font-medium leading-normal">{children}</p> {/* Slightly larger text on desktop */}
    </Link>
  );
};

export default NavItem;