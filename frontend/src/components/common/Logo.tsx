import React from 'react';

interface LogoProps {
    className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = '' }) => {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 200 60"
            className={className}
        >
            <circle cx="30" cy="30" r="25" fill="currentColor" opacity="0.1"/>
            <path 
                d="M25,30 Q40,10 55,30" 
                stroke="currentColor" 
                strokeWidth="2" 
                fill="none"
            />
            <path 
                d="M25,30 Q40,50 55,30" 
                stroke="currentColor" 
                strokeWidth="2" 
                fill="none"
            />
            <circle cx="25" cy="30" r="4" fill="currentColor"/>
            <circle cx="55" cy="30" r="4" fill="currentColor"/>
            <circle cx="40" cy="20" r="2" fill="currentColor"/>
            <circle cx="40" cy="40" r="2" fill="currentColor"/>
            <text 
                x="75" 
                y="35" 
                fontFamily="Arial" 
                fontWeight="bold" 
                fontSize="24" 
                fill="currentColor"
            >
                Delilah
            </text>
            <text 
                x="75" 
                y="50" 
                fontFamily="Arial" 
                fontSize="16" 
                className="text-gray-500"
            >
                agentic
            </text>
        </svg>
    );
};