
import React from 'react';

const ThermometerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6.375l2.125 2.125M13.5 6.375V2.25m0 4.125C13.5 5.56 12.94 5 12.25 5h-1.5C9.06 5 8.5 5.56 8.5 6.25S9.06 7.5 9.75 7.5h1.5c.69 0 1.25-.56 1.25-1.25V2.25m0 4.125C13.5 5.56 12.94 5 12.25 5h-1.5C9.06 5 8.5 5.56 8.5 6.25m4.25 7.875V19.5a2.25 2.25 0 01-2.25 2.25H10.5a2.25 2.25 0 01-2.25-2.25v-5.25c0-.99.596-1.853 1.457-2.176l.24-.078.24-.078.24-.078a1.5 1.5 0 01.916-.013l.256.05.256.05.256.05a1.5 1.5 0 00.916.013l.256-.05.256-.05.256-.05a1.5 1.5 0 01.916.013l.24.078.24.078.24.078c.861.323 1.457 1.186 1.457 2.176zM8.5 19.5h7M8.5 15h7" />
    </svg>
);

export default ThermometerIcon;
