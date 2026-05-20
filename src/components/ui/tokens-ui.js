/* ============================================================
   Design System Tokens — JS-side constants (mirror de tokens.css)
   ============================================================
   Pour usages inline style. Source de vérité côté CSS reste
   tokens.css, mais ici on a les valeurs résolues utilisables
   directement dans les inline styles React.
   ============================================================ */

export const tokens = {
  bg: 'var(--bg)',
  blueLight: 'var(--blue-100)',
  blue300: 'var(--blue-300)',
  blue500: 'var(--blue-500)',
  blue700: 'var(--blue-700)',
  blue900: 'var(--blue-900)',
  rose300: 'var(--rose-300)',
  rose500: 'var(--rose-500)',
  rose700: 'var(--rose-700)',
  violet: 'var(--violet)',
  textPrimary: 'var(--blue-900)',
  textSecondary: 'var(--text-secondary)',
  textMuted: 'var(--text-muted)',

  gradientBlue: 'var(--gradient-blue)',
  gradientRose: 'var(--gradient-rose)',
  gradientMain: 'var(--gradient-main)',
  gradientViolet: 'var(--gradient-violet)',

  glass: {
    bg: 'rgba(255, 255, 255, 0.65)',
    bgStrong: 'rgba(255, 255, 255, 0.85)',
    border: '1px solid rgba(255, 255, 255, 0.85)',
    blur: 'blur(24px)',
    shadow: '0 4px 24px rgba(10, 36, 56, 0.07)',
    shadowDeep: '0 12px 40px rgba(10, 36, 56, 0.12)',
  },

  shadow: {
    soft: '0 4px 24px rgba(10, 36, 56, 0.07)',
    card: '0 8px 32px rgba(10, 36, 56, 0.10)',
    deep: '0 12px 40px rgba(10, 36, 56, 0.14)',
    blue: '0 8px 24px rgba(26, 90, 127, 0.30)',
    rose: '0 8px 24px rgba(200, 112, 144, 0.30)',
  },

  radius: {
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 28,
    pill: 50,
    circle: '50%',
  },

  space: {
    1: 4, 2: 8, 3: 12, 4: 16, 5: 24, 6: 32, 7: 48, 8: 64,
  },

  fonts: {
    display: "'Cormorant Garamond', Georgia, serif",
    ui: "'Inter', system-ui, sans-serif",
    body: "'Inter', system-ui, sans-serif",
  },

  ease: {
    out: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
    inOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
    apple: 'cubic-bezier(0.32, 0.72, 0, 1)',
  },

  duration: {
    fast: 120,
    base: 240,
    slow: 480,
    cinematic: 800,
  },

  z: {
    bottomNav: 30,
    backButton: 80,
    sosButton: 100,
    menuButton: 100,
    actionSheet: 200,
    modal: 9999,
  },
};
