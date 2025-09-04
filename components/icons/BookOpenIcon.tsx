import React from 'react';

// Phosphor-style BookOpen icon
const BookOpenIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256" {...props}>
    <path d="M240,40H100a36,36,0,0,0-36,36V216a8,8,0,0,0,16,0V177.37a44.05,44.05,0,0,1,40-43.22V80a20,20,0,0,1,20-20h76a8,8,0,0,0,0-16Zm-16,0V200a8,8,0,0,1-16,0V56a8,8,0,0,0-8-8H120a4,4,0,0,0-4,4v74.63a44.05,44.05,0,0,1,40-43.22V56a8,8,0,0,1,8-8h52A8,8,0,0,1,224,56ZM92,216a8,8,0,0,1-16,0V76a20,20,0,0,1,20-20H216a8,8,0,0,1,0,16H96a4,4,0,0,0-4,4V216Z"></path>
  </svg>
);

export default BookOpenIcon;