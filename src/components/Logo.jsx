import React from 'react';

export const LogoIcon = ({ size = 38, className = '' }) => {
  return (
    <div
      className={`pocketwise-logo-icon-wrap ${className}`}
      style={{
        width: size,
        height: size,
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="pocketwise-svg-icon"
      >
        <defs>
          {/* Main Body Gradient */}
          <linearGradient id="pwBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E1338" />
            <stop offset="45%" stopColor="#2E1065" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>

          {/* Border Glow Gradient */}
          <linearGradient id="pwNeonBorder" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A855F7" />
            <stop offset="35%" stopColor="#6366F1" />
            <stop offset="70%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>

          {/* Wallet Flap Gradient */}
          <linearGradient id="pwFlapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818CF8" />
            <stop offset="50%" stopColor="#7968EF" />
            <stop offset="100%" stopColor="#4F46E5" />
          </linearGradient>

          {/* Stylized P Ribbon Gradient */}
          <linearGradient id="pwPRibbon" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="50%" stopColor="#818CF8" />
            <stop offset="100%" stopColor="#C084FC" />
          </linearGradient>

          {/* Sparkle Star Gradient */}
          <linearGradient id="pwStarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="50%" stopColor="#F472B6" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>

          {/* Glow Filters */}
          <filter id="pwGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#7968EF" floodOpacity="0.45" />
          </filter>
          <filter id="pwStarGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Shadow & Base Squircle */}
        <rect
          x="6"
          y="6"
          width="88"
          height="88"
          rx="26"
          fill="url(#pwBodyGrad)"
          filter="url(#pwGlow)"
        />

        {/* Neon Border Outline */}
        <rect
          x="7.5"
          y="7.5"
          width="85"
          height="85"
          rx="24.5"
          stroke="url(#pwNeonBorder)"
          strokeWidth="3"
        />

        {/* Outer Sleek Pocket Base Card / Flap */}
        <path
          d="M 22 34 C 22 26 28 20 36 20 L 70 20 C 76 20 80 24 80 30 L 80 66 C 80 74 74 80 66 80 L 34 80 C 26 80 22 74 22 66 Z"
          fill="rgba(121, 104, 239, 0.18)"
          stroke="rgba(255, 255, 255, 0.12)"
          strokeWidth="1.5"
        />

        {/* Dimensional Pocket Lip Layer */}
        <path
          d="M 22 38 C 22 32 26 28 32 28 L 74 28 C 77.3 28 80 30.7 80 34 L 80 44 C 80 44 65 52 50 52 C 35 52 22 44 22 44 Z"
          fill="url(#pwFlapGrad)"
          opacity="0.85"
        />

        {/* Distinctive Monogram 'P' (Card Pocket + Arrow Forward Growth) */}
        {/* Vertical stem */}
        <rect
          x="34"
          y="35"
          width="9"
          height="38"
          rx="4.5"
          fill="url(#pwPRibbon)"
        />

        {/* Curved upper bowl of P forming folded pocket flap */}
        <path
          d="M 38 35 L 56 35 C 64.5 35 71 41.5 71 50 C 71 58.5 64.5 65 56 65 L 38 65"
          fill="none"
          stroke="url(#pwPRibbon)"
          strokeWidth="9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Inner dynamic lightning / arrow core */}
        <circle cx="53" cy="50" r="4.5" fill="#38BDF8" />

        {/* Gen Z Sparkle Star ✦ on upper right corner */}
        <g filter="url(#pwStarGlow)">
          <path
            d="M 80 18 Q 80 26 88 26 Q 80 26 80 34 Q 80 26 72 26 Q 80 26 80 18 Z"
            fill="url(#pwStarGrad)"
          />
        </g>

        {/* Micro accent dots */}
        <circle cx="21" cy="74" r="2.5" fill="#06B6D4" opacity="0.8" />
        <circle cx="82" cy="70" r="2" fill="#F472B6" opacity="0.9" />
      </svg>
    </div>
  );
};

const Logo = ({
  size = 'md',
  showTagline = true,
  variant = 'dark',
  showSparkle = true,
  className = '',
  onClick,
}) => {
  const sizeMap = {
    sm: { icon: 30, title: '1.05rem', tag: '0.625rem', gap: 9 },
    md: { icon: 38, title: '1.25rem', tag: '0.6875rem', gap: 11 },
    lg: { icon: 46, title: '1.5rem', tag: '0.75rem', gap: 13 },
    xl: { icon: 56, title: '1.875rem', tag: '0.8125rem', gap: 15 },
  };

  const currentSize = typeof size === 'number'
    ? { icon: size, title: `${size * 0.033}rem`, tag: '0.6875rem', gap: 10 }
    : (sizeMap[size] || sizeMap.md);

  const isLight = variant === 'light';

  return (
    <div
      className={`pocketwise-logo-brand ${variant} ${className}`}
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: currentSize.gap,
        textDecoration: 'none',
        userSelect: 'none',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <LogoIcon size={currentSize.icon} />

      <div className="pocketwise-logo-text-group" style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          className="pocketwise-logo-wordmark"
          style={{
            fontSize: currentSize.title,
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <span
            style={{
              color: isLight ? '#0F172A' : '#FFFFFF',
              fontWeight: 800,
            }}
          >
            Pocket
          </span>
          <span
            className="pocketwise-gradient-text"
            style={{
              background: 'linear-gradient(135deg, #A78BFA 0%, #38BDF8 60%, #34D399 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 900,
            }}
          >
            wise
          </span>
          {showSparkle && (
            <span
              className="pocketwise-sparkle-badge"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.6em',
                lineHeight: 1,
                padding: '2px 5px',
                borderRadius: '6px',
                background: 'linear-gradient(135deg, rgba(168,85,247,0.2) 0%, rgba(6,182,212,0.2) 100%)',
                border: '1px solid rgba(168,85,247,0.3)',
                color: '#38BDF8',
                fontWeight: 700,
                marginLeft: 2,
              }}
            >
              ✦
            </span>
          )}
        </div>

        {showTagline && (
          <div
            className="pocketwise-logo-subtext"
            style={{
              fontSize: currentSize.tag,
              color: isLight ? '#64748B' : 'rgba(255, 255, 255, 0.5)',
              fontWeight: 600,
              letterSpacing: '0.04em',
              marginTop: 3,
              textTransform: 'uppercase',
            }}
          >
            Your money, your moves.
          </div>
        )}
      </div>
    </div>
  );
};

export default Logo;
