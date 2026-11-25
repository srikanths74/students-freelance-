import React from 'react';

/**
 * BrandLogo - Premium, Elegant & Luxurious Monogram Emblem & Wordmark
 * Combines an architectural diamond crest, graduation nexus, and sleek modern typography.
 */
export default function BrandLogo({
  size = 36,
  showText = true,
  subtitle = 'PREMIER STUDENT MARKETPLACE',
  className = '',
  onClick = undefined,
  style = {}
}) {
  return (
    <div
      className={`brand-logo ${className}`}
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.65rem',
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        ...style
      }}
    >
      {/* Luxury Geometric Diamond Crest SVG */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          flexShrink: 0,
          filter: 'drop-shadow(0 4px 10px rgba(5, 150, 105, 0.22))',
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        className="brand-logo-emblem"
      >
        <defs>
          {/* Imperial Deep Emerald & Radiant Mint Gradients */}
          <linearGradient id="luxury_base" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#064E3B" />
            <stop offset="50%" stopColor="#059669" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>

          <linearGradient id="luxury_facet_left" x1="0" y1="20" x2="50" y2="80" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#047857" stopOpacity="0.8" />
          </linearGradient>

          <linearGradient id="luxury_facet_right" x1="50" y1="20" x2="100" y2="80" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>

          <linearGradient id="gold_accent" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="50%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#FBBF24" />
          </linearGradient>

          <linearGradient id="specular_glow" x1="50" y1="0" x2="50" y2="60" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Outer Hexagonal Shield / Shield Frame */}
        <path
          d="M50 4 L88 24 L88 66 L50 96 L12 66 L12 24 Z"
          fill="url(#luxury_base)"
          stroke="#064E3B"
          strokeWidth="1.5"
        />

        {/* Inner Specular Bevel Top */}
        <path
          d="M50 7 L84 25 L84 64 L50 91 L16 64 L16 25 Z"
          fill="url(#specular_glow)"
          opacity="0.25"
        />

        {/* Left Dynamic Wing / Facet */}
        <path
          d="M50 18 L24 33 L24 60 L50 78 L50 48 Z"
          fill="url(#luxury_facet_left)"
        />

        {/* Right Dynamic Wing / Facet */}
        <path
          d="M50 18 L76 33 L76 60 L50 78 L50 48 Z"
          fill="url(#luxury_facet_right)"
        />

        {/* Stylized Architectural Academic Crest Apex (Mortarboard Crown) */}
        <polygon
          points="50,16 78,32 50,48 22,32"
          fill="#FFFFFF"
          fillOpacity="0.95"
        />

        {/* Central Monogram Diamond Core */}
        <polygon
          points="50,42 62,54 50,66 38,54"
          fill="url(#gold_accent)"
          stroke="#FFFFFF"
          strokeWidth="1.5"
        />

        {/* Elegant Bottom Pillar / Anchor */}
        <path
          d="M48 66 L52 66 L52 84 L48 84 Z"
          fill="#FFFFFF"
          opacity="0.9"
        />
      </svg>

      {/* Luxury Typography Wordmark */}
      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', letterSpacing: '-0.035em' }}>
            <span style={{
              fontSize: `${Math.max(size * 0.48, 16)}px`,
              fontWeight: 800,
              color: 'var(--text-main, #0F291E)',
              fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif"
            }}>
              Campus
            </span>
            <span style={{
              fontSize: `${Math.max(size * 0.48, 16)}px`,
              fontWeight: 900,
              background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif"
            }}>
              Gig
            </span>
          </div>
          <span style={{
            fontSize: `${Math.max(size * 0.19, 7.5)}px`,
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--primary, #059669)',
            marginTop: '2px',
            fontFamily: "'Inter', sans-serif"
          }}>
            {subtitle}
          </span>
        </div>
      )}
    </div>
  );
}
