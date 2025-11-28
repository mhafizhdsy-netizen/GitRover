
import React from 'react';

export const GitRoverIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="icon-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'rgb(var(--color-primary))', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: 'rgb(var(--color-secondary))', stopOpacity: 1 }} />
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <g fill="url(#icon-grad)" transform="translate(50 50)">
      <g transform="rotate(30)">
        {/* Base Hexagon shape with low opacity for background structure */}
        <path d="M-23 -40 L23 -40 L46 0 L23 40 L-23 40 L-46 0 Z" fillOpacity="0.1"/>

        {/* Right side 'shutter' blade with glow */}
        <path d="M0 0 L23 -40 L46 0 L23 40 Z" filter="url(#glow)" />
        
        {/* Left side 'shutter' blade */}
        <path d="M0 0 L-23 40 L-46 0 L-23 -40 Z" />

        {/* Top and Bottom accent pieces for depth */}
        <path d="M-23 -40 L-11.5 -20 L11.5 -20 L23 -40 Z" fillOpacity="0.5" />
        <path d="M-23 40 L-11.5 20 L11.5 20 L23 40 Z" fillOpacity="0.5" />
      </g>
    </g>
  </svg>
);

export const GitRoverLoadingIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({ className, ...props }) => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <defs>
        <linearGradient id="load-grad" x1="0%" y1="0%" x2="100%" y2="0%">
             <stop offset="0%" style={{ stopColor: 'rgb(var(--color-primary))', stopOpacity: 1 }} />
             <stop offset="100%" style={{ stopColor: 'rgb(var(--color-secondary))', stopOpacity: 1 }} />
        </linearGradient>
    </defs>
    <g transform="translate(50 50)">
      <g transform="rotate(30)">
        {/* Outline Hexagon - Draws first */}
        <path 
            d="M-23 -40 L23 -40 L46 0 L23 40 L-23 40 L-46 0 Z" 
            fill="none" 
            stroke="url(#load-grad)" 
            strokeWidth="2"
            strokeLinecap="round"
            className="animate-draw"
            style={{ strokeDasharray: 300, strokeDashoffset: 300 }}
        />

        {/* Inner Shapes - Draw second */}
        <path 
            d="M0 0 L23 -40 L46 0 L23 40 Z" 
            fill="url(#load-grad)" 
            className="animate-fade-fill"
            style={{ opacity: 0, animationDelay: '1s' }}
        />
        <path 
            d="M0 0 L-23 40 L-46 0 L-23 -40 Z" 
            fill="url(#load-grad)" 
             className="animate-fade-fill"
             style={{ opacity: 0, animationDelay: '1.2s' }}
        />
      </g>
    </g>
  </svg>
);
