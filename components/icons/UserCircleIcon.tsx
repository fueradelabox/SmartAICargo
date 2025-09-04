import React from 'react';

const UserCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256" {...props}>
    <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm0-128a40,40,0,1,0,40,40A40,40,0,0,0,128,88Zm0,104c-28.3,0-53.53,11.23-72.23,29.35a87.69,87.69,0,0,1,144.46,0C181.53,203.23,156.3,192,128,192Z"></path>
  </svg>
);

export default UserCircleIcon;