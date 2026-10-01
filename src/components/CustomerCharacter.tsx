import React from 'react';
import { CustomerData } from '../types/game';

interface CustomerCharacterProps {
  customer: CustomerData;
  isSatisfied?: boolean;
  size?: 'sm' | 'md' | 'lg';
  isWalkingIn?: boolean;
}

export const CustomerCharacter: React.FC<CustomerCharacterProps> = ({
  customer,
  isSatisfied = false,
  size = 'md',
  isWalkingIn = false,
}) => {
  const scale = size === 'sm' ? 0.65 : size === 'lg' ? 1.25 : 1.0;
  const width = 160 * scale;
  const height = 240 * scale;

  const currentExpression = isSatisfied ? 'happy' : customer.expression;

  return (
    <div
      className={`relative inline-flex flex-col items-center select-none transition-all duration-300 ${
        isWalkingIn ? 'animate-bounce' : ''
      }`}
      style={{ width, height }}
    >
      <svg
        viewBox="0 0 160 240"
        className="w-full h-full overflow-visible drop-shadow-lg"
      >
        {/* Subtle drop shadow under feet */}
        <ellipse
          cx="80"
          cy="230"
          rx="45"
          ry="8"
          fill="rgba(0, 0, 0, 0.25)"
        />

        {/* 2 Cute Legs & Feet underneath body */}
        <g className="transition-transform">
          {/* Left leg */}
          <line
            x1="65"
            y1="205"
            x2="65"
            y2="225"
            stroke="#1E293B"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <ellipse
            cx="60"
            cy="226"
            rx="9"
            ry="4.5"
            fill="#0F172A"
          />

          {/* Right leg */}
          <line
            x1="95"
            y1="205"
            x2="95"
            y2="225"
            stroke="#1E293B"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <ellipse
            cx="100"
            cy="226"
            rx="9"
            ry="4.5"
            fill="#0F172A"
          />
        </g>

        {/* 2 Expressive Arms & Hands */}
        <g className="transition-transform">
          {/* Left Arm */}
          <path
            d="M 50 128 Q 28 152 24 175"
            fill="none"
            stroke={customer.bodyColor}
            strokeWidth="8"
            strokeLinecap="round"
          />
          <circle cx="23" cy="178" r="6" fill={customer.headColor} stroke="#0F172A" strokeWidth="2" />

          {/* Right Arm */}
          <path
            d="M 110 128 Q 132 152 136 175"
            fill="none"
            stroke={customer.bodyColor}
            strokeWidth="8"
            strokeLinecap="round"
          />
          <circle cx="137" cy="178" r="6" fill={customer.headColor} stroke="#0F172A" strokeWidth="2" />
        </g>

        {/* TRIANGLE BODY (Corpo a triangolo, NO braccia) */}
        <defs>
          <linearGradient id={`bodyGrad-${customer.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={customer.bodyColor} />
            <stop offset="100%" stopColor={adjustColorBrightness(customer.bodyColor, -25)} />
          </linearGradient>
          <filter id="softGlow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.3" />
          </filter>
        </defs>

        <polygon
          points="80,95 24,208 136,208"
          fill={`url(#bodyGrad-${customer.id})`}
          stroke="#0F172A"
          strokeWidth="3.5"
          strokeLinejoin="round"
          className="transition-colors duration-300"
        />

        {/* Triangle Inner Decorative Elements / Pattern */}
        {customer.accessory === 'bowtie' && (
          <g transform="translate(80, 115)">
            <polygon points="-12,-6 0,-1 -12,4" fill="#0F172A" />
            <polygon points="12,-6 0,-1 12,4" fill="#0F172A" />
            <circle cx="0" cy="-1" r="3.5" fill="#EF4444" />
          </g>
        )}

        {customer.accessory === 'tie' && (
          <g transform="translate(80, 112)">
            <polygon points="-4,0 4,0 6,28 0,35 -6,28" fill="#1E293B" stroke="#0F172A" strokeWidth="1.5" />
            <circle cx="0" cy="2" r="3" fill="#F59E0B" />
          </g>
        )}

        {customer.accessory === 'necklace' && (
          <path
            d="M 62 130 Q 80 148 98 130"
            fill="none"
            stroke="#FBBF24"
            strokeWidth="3"
            strokeDasharray="4,2"
          />
        )}

        {/* Cute pocket or seam lines on triangle body */}
        <path
          d="M 68 165 L 92 165"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* FLOATING ROUND HEAD (Testa tonda staccata dal collo) */}
        {/* Notice it's detached: y center is 46, body top apex is 95 -> clear gap of ~25px! */}
        <g
          className="transition-transform duration-300"
          style={{
            transform: isSatisfied
              ? 'translateY(-12px) scale(1.05)'
              : 'translateY(-2px)',
          }}
        >
          {/* Subtle floating aura/shadow between head and body */}
          <ellipse
            cx="80"
            cy="84"
            rx="16"
            ry="3.5"
            fill="rgba(0, 0, 0, 0.15)"
          />

          {/* Round Head */}
          <circle
            cx="80"
            cy="46"
            r="32"
            fill={customer.headColor}
            stroke="#0F172A"
            strokeWidth="3.5"
            className="drop-shadow-sm"
          />

          {/* Cheek blush */}
          <ellipse cx="60" cy="54" rx="4.5" ry="3" fill="#FB7185" opacity="0.6" />
          <ellipse cx="100" cy="54" rx="4.5" ry="3" fill="#FB7185" opacity="0.6" />

          {/* Eyes depending on expression */}
          {currentExpression === 'happy' || isSatisfied ? (
            <g>
              {/* Happy squinting eyes ^ ^ */}
              <path
                d="M 63 46 Q 70 38 77 46"
                fill="none"
                stroke="#0F172A"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <path
                d="M 83 46 Q 90 38 97 46"
                fill="none"
                stroke="#0F172A"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              {/* Smiling mouth with teeth */}
              <path
                d="M 70 56 Q 80 70 90 56 Z"
                fill="#EF4444"
                stroke="#0F172A"
                strokeWidth="2.5"
              />
            </g>
          ) : currentExpression === 'crying' ? (
            <g>
              {/* Crying teardrop eyes > < */}
              <path
                d="M 64 42 L 72 47 L 64 52"
                fill="none"
                stroke="#0F172A"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M 96 42 L 88 47 L 96 52"
                fill="none"
                stroke="#0F172A"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Animated tear stream */}
              <path
                d="M 60 52 Q 54 62 58 72"
                fill="none"
                stroke="#38BDF8"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M 100 52 Q 106 62 102 72"
                fill="none"
                stroke="#38BDF8"
                strokeWidth="3"
                strokeLinecap="round"
              />
              {/* Trembling sad mouth */}
              <path
                d="M 72 63 Q 80 56 88 63"
                fill="none"
                stroke="#0F172A"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </g>
          ) : (
            <g>
              {/* Worried round pupils */}
              <ellipse cx="68" cy="45" rx="5" ry="6" fill="#0F172A" />
              <ellipse cx="92" cy="45" rx="5" ry="6" fill="#0F172A" />
              <circle cx="66" cy="43" r="2" fill="#FFFFFF" />
              <circle cx="90" cy="43" r="2" fill="#FFFFFF" />
              {/* Worried slanted eyebrows */}
              <path
                d="M 61 36 L 73 39"
                stroke="#0F172A"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M 99 36 L 87 39"
                stroke="#0F172A"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {/* Small wavy open mouth */}
              <ellipse cx="80" cy="60" rx="4.5" ry="5.5" fill="#0F172A" />
            </g>
          )}

          {/* HEAD ACCESSORIES */}
          {customer.accessory === 'glasses' && (
            <g>
              <rect x="58" y="38" width="18" height="15" rx="4" fill="none" stroke="#0F172A" strokeWidth="2.5" />
              <rect x="84" y="38" width="18" height="15" rx="4" fill="none" stroke="#0F172A" strokeWidth="2.5" />
              <line x1="76" y1="45" x2="84" y2="45" stroke="#0F172A" strokeWidth="2.5" />
            </g>
          )}

          {customer.accessory === 'sunglasses' && (
            <g>
              <polygon points="56,38 77,38 74,52 60,52" fill="#0F172A" />
              <polygon points="83,38 104,38 100,52 86,52" fill="#0F172A" />
              <line x1="77" y1="43" x2="83" y2="43" stroke="#0F172A" strokeWidth="3" />
              {/* Lens shine */}
              <line x1="62" y1="41" x2="70" y2="49" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
            </g>
          )}

          {customer.accessory === 'cap' && (
            <g>
              {/* Baseball cap turned backwards or front */}
              <path
                d="M 52 35 Q 80 12 108 35 Z"
                fill="#EF4444"
                stroke="#0F172A"
                strokeWidth="3"
              />
              <path
                d="M 104 35 Q 125 36 128 42 L 105 40 Z"
                fill="#DC2626"
                stroke="#0F172A"
                strokeWidth="2"
              />
            </g>
          )}

          {customer.accessory === 'hat' && (
            <g>
              {/* Cute top hat */}
              <ellipse cx="80" cy="24" rx="28" ry="6" fill="#1E293B" stroke="#0F172A" strokeWidth="2.5" />
              <rect x="62" y="4" width="36" height="20" rx="3" fill="#334155" stroke="#0F172A" strokeWidth="2.5" />
              <rect x="62" y="18" width="36" height="4" fill="#F59E0B" />
            </g>
          )}

          {customer.accessory === 'headband' && (
            <g>
              {/* Sports headband */}
              <path
                d="M 50 32 Q 80 30 110 32"
                stroke="#10B981"
                strokeWidth="7"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 50 32 Q 80 30 110 32"
                stroke="#FFFFFF"
                strokeWidth="2"
                strokeDasharray="4,4"
                fill="none"
              />
            </g>
          )}
        </g>
      </svg>
    </div>
  );
};

function adjustColorBrightness(hex: string, percent: number) {
  let num = parseInt(hex.replace('#', ''), 16);
  if (isNaN(num)) return hex;
  let amt = Math.round(2.55 * percent);
  let R = (num >> 16) + amt;
  let G = (num >> 8 & 0x00FF) + amt;
  let B = (num & 0x0000FF) + amt;
  return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}
