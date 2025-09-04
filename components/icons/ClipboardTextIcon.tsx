
import React from 'react';

// Phosphor-style ClipboardText icon
const ClipboardTextIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256" {...props}>
    <path d="M168,40H144a48.05,48.05,0,0,0-32-32,8,8,0,0,0,0,16,32,32,0,0,1,32,32h24a8,8,0,0,0,8-8V32A16,16,0,0,0,160,16H96A16,16,0,0,0,80,32v8a8,8,0,0,0,16,0V40h24a32,32,0,0,1,32,32,8,8,0,0,0,0,16,48.05,48.05,0,0,0-32-32H80v8a8,8,0,0,0,16,0V80a16,16,0,0,0-16-16H40A16,16,0,0,0,24,80V216a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V80A16,16,0,0,0,216,64H168a8,8,0,0,0,0,16h48V216H40V80H80v48a8,8,0,0,0,16,0V96h56v24a8,8,0,0,0,16,0V96h8a8,8,0,0,0,0-16h-8V48a8,8,0,0,0-8-8ZM128,152H80a8,8,0,0,0,0,16h48a8,8,0,0,0,0-16Zm48-32H80a8,8,0,0,0,0,16h96a8,8,0,0,0,0-16Z"></path>
  </svg>
);

export default ClipboardTextIcon;
