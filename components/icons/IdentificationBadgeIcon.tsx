import React from 'react';

const IdentificationBadgeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256" {...props}>
    <path d="M224,48H32A16,16,0,0,0,16,64V192a16,16,0,0,0,16,16H224a16,16,0,0,0,16-16V64A16,16,0,0,0,224,48ZM100,112a28,28,0,1,1,28,28A28,28,0,0,1,100,112Zm88,72H68.22C75.8,167,88.61,156,108,156c17.51,0,30.34,10.74,38.6,28H224a16,16,0,0,0,16-16V192ZM32,64H224V74.83c-13.88-12-32.22-20.26-52-22.61a44,44,0,1,0-52.06,0C99.89,54.55,81.33,63,68,75V64ZM128,68a28,28,0,1,1-28,28A28,28,0,0,1,128,68Zm80,108c-7.23-14.18-19.14-24.3-33.81-28.53A44.07,44.07,0,0,0,128,156c-19.46,0-35.85,11.08-46.19,20H208Z"></path>
  </svg>
);

export default IdentificationBadgeIcon;