import React from 'react';

// Using a generic Phosphor-like list/menu icon
const MenuPhosphorIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256" {...props}>
    <path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM40,88H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16ZM216,168H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z"></path>
  </svg>
);

export default MenuPhosphorIcon;