import React from 'react';

export const StarfieldBackground: React.FC = () => {
    return (
        <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 overflow-hidden z-0 bg-[#060814]"
        >
            <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-violet-600/12 blur-[130px]" />
            <div className="absolute top-1/3 right-1/5 h-96 w-96 rounded-full bg-cyan-500/10 blur-[140px]" />
            <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-blue-600/10 blur-[120px]" />
            <svg className="absolute inset-0 h-full w-full opacity-35" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="orbit-stars" width="160" height="160" patternUnits="userSpaceOnUse">
                        <circle cx="24" cy="30" r="1" fill="#94a3b8" />
                        <circle cx="95" cy="70" r="1.2" fill="#38bdf8" />
                        <circle cx="140" cy="25" r="0.8" fill="#c084fc" />
                        <circle cx="60" cy="135" r="1" fill="#e2e8f0" />
                        <circle cx="130" cy="120" r="1.1" fill="#64748b" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#orbit-stars)" />
            </svg>
        </div>
    );
};