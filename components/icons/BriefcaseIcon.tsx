import React from 'react';

const BriefcaseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256" {...props}>
    <path d="M232,72H184V64a24,24,0,0,0-24-24H96A24,24,0,0,0,72,64v8H24A16,16,0,0,0,8,88V192a16,16,0,0,0,16,16H232a16,16,0,0,0,16-16V88A16,16,0,0,0,232,72ZM88,64a8,8,0,0,1,8-8h64a8,8,0,0,1,8,8v8H88Zm144,128H24V88H88v24a8,8,0,0,0,8,8h64a8,8,0,0,0,8-8V88h64Z"></path>
  </svg>
);

export default BriefcaseIcon;