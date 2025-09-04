
import React from 'react';

const PackageIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10.5 11.25h3M10.5 15h3M4.5 7.5V5.625c0-.621.504-1.125 1.125-1.125h12.75c.621 0 1.125.504 1.125 1.125V7.5m-15 0h15" />
    </svg>
);

export default PackageIcon;
