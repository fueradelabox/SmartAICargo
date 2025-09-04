import React from 'react';

// Phosphor-style SignOut icon
const SignOutIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256" {...props}>
    <path d="M112,216a8,8,0,0,1-8,8H48a16,16,0,0,1-16-16V48A16,16,0,0,1,48,32h56a8,8,0,0,1,0,16H56V208h48A8,8,0,0,1,112,216Zm117.66-82.34-48-48a8,8,0,0,0-11.32,11.32L192.69,120H104a8,8,0,0,0,0,16h88.69l-22.35,22.34a8,8,0,0,0,11.32,11.32l48-48A8,8,0,0,0,229.66,133.66Z"></path>
  </svg>
);

export default SignOutIcon;
