import React from 'react';

/**
 * ElevateIn Logo Component - Premium Geometric Version
 * A sophisticated, faceted design representing scalable growth and executive precision.
 */
export default function Logo({ size = 24, className = "" }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id="logo-gradient-1" x1="20" y1="5" x2="20" y2="35" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#004182" />
                    <stop offset="1" stopColor="#002d5a" />
                </linearGradient>
            </defs>

            {/* Main Diamond/Arrowhead Base */}
            <path
                d="M20 4L34 30L20 24L6 30L20 4Z"
                fill="url(#logo-gradient-1)"
            />

            {/* Top Left Facet - High Contrast */}
            <path
                d="M20 4L6 30L20 20V4Z"
                fill="white"
                fillOpacity="0.1"
            />

            {/* Top Right Facet - Medium Contrast */}
            <path
                d="M20 4L34 30L20 20V4Z"
                fill="white"
                fillOpacity="0.05"
            />

            {/* Bottom Inner Facets - Depth Shadow */}
            <path
                d="M20 24L6 30L20 20V24Z"
                fill="black"
                fillOpacity="0.2"
            />
            <path
                d="M20 24L34 30L20 20V24Z"
                fill="black"
                fillOpacity="0.1"
            />

            {/* Sharp Accent Lines */}
            <path
                d="M20 4L20 20"
                stroke="white"
                strokeOpacity="0.2"
                strokeWidth="0.5"
            />
            <path
                d="M20 20L6 30"
                stroke="white"
                strokeOpacity="0.1"
                strokeWidth="0.5"
            />
            <path
                d="M20 20L34 30"
                stroke="white"
                strokeOpacity="0.1"
                strokeWidth="0.5"
            />

            {/* Central Vertical Core Line */}
            <path
                d="M20 4V35"
                stroke="currentColor"
                strokeOpacity="0.1"
                strokeWidth="1"
                strokeLinecap="round"
            />
        </svg>
    );
}
