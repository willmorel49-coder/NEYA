// NÉYA — Design tokens scalable system.
// Importé progressivement dans App.jsx. Adoption non-destructive : les valeurs ici
// reproduisent ce qui existe déjà, mais formalisé. Migrer un écran à la fois.

export const tokens = {
  // ─── Espacement — échelle 4 (Material 3 + 2px exceptions)
  space: { 0: 0, 0.5: 2, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 7: 28, 8: 32, 9: 40, 10: 48, 12: 64, 16: 80 },

  // ─── Type scale — 10 paliers (Major Second ~1.125)
  fontSize: {
    micro:   10,
    xs:      11,
    sm:      12,
    base:    13,
    md:      14,
    lg:      16,
    xl:      18,
    h3:      22,
    h2:      28,
    h1:      40,
    display: 54,
  },

  // ─── Border radius — sémantique
  radius: { none: 0, xs: 4, sm: 8, md: 12, lg: 16, xl: 20, '2xl': 24, pill: 100, full: 9999 },

  // ─── Élévation — 5 niveaux + halo archétype runtime
  elevation: {
    0: 'none',
    1: '0 1px 8px rgba(0,0,0,0.24)',                                  // chip / inline
    2: '0 2px 12px rgba(0,0,0,0.30)',                                  // card
    3: '0 4px 22px rgba(0,0,0,0.32)',                                  // button rest
    4: '0 6px 36px rgba(0,0,0,0.40), 0 2px 12px rgba(0,0,0,0.30)',     // button glow
    5: '0 16px 56px rgba(0,0,0,0.65)',                                 // modal
    halo: (rgb, i = 0.40) => `0 6px 36px rgba(${rgb},${i}), 0 0 60px rgba(${rgb},${i / 2})`,
  },

  // ─── Durations — 5 paliers + ambient
  duration: {
    instant:  '80ms',   // haptic visuel (flash press), focus ring
    fast:     '160ms',  // hover, focus, color swap
    base:     '240ms',  // press release, toggle, tab change
    slow:     '360ms',  // modal enter, card lift, accordion
    slower:   '500ms',  // page transition, world reveal
    cinema:   '1400ms', // texte séquentiel onboarding
    ambient:  '8000ms', // breath, float, glow infinies
  },

  // ─── Easing — courbes Apple/Linear/Material 3
  easing: {
    standard:   'cubic-bezier(0.4, 0, 0.2, 1)',     // entrée/sortie générique
    emphasized: 'cubic-bezier(0.22, 1, 0.36, 1)',   // easeOutQuint, importance
    decelerate: 'cubic-bezier(0, 0, 0.2, 1)',       // élément qui entre
    accelerate: 'cubic-bezier(0.4, 0, 1, 1)',       // élément qui sort
    spring:     'cubic-bezier(0.34, 1.56, 0.64, 1)', // press release, badge pop (overshoot)
    soft:       'cubic-bezier(0.16, 1.36, 0.32, 1)', // modal entry (soft overshoot 6%)
    ambient:    'cubic-bezier(0.45, 0, 0.55, 1)',   // sine, boucles infinies
  },

  // ─── Letter spacing — 5 paliers sémantiques uniquement
  letterSpacing: {
    tight:  '-0.02em',
    normal: '0em',
    wide:   '0.06em',
    wider:  '0.14em',
    widest: '0.24em',
  },

  // ─── Alphas hex pour archétype colorisé (concaténation `${color}${alpha}`)
  alpha: {
    5: '0d', 10: '1a', 15: '26', 20: '33', 25: '40', 30: '4d', 40: '66',
    50: '80', 55: '8c', 60: '99', 66: 'a8', 70: 'b3', 80: 'cc', 90: 'e6',
  },

  // ─── Surfaces — alphas blanc/fond standardisés
  surface: {
    raised1:  'rgba(255,255,255,0.04)',
    raised2:  'rgba(255,255,255,0.06)',
    raised3:  'rgba(255,255,255,0.10)',
    overlay1: 'rgba(5,8,16,0.30)',
    overlay2: 'rgba(5,8,16,0.50)',
    overlay3: 'rgba(5,8,16,0.80)',
    blackout: 'rgba(5,8,16,0.97)',
  },

  // ─── Z-index sémantique (nettoyé)
  z: {
    below:        -1,
    base:         0,
    raised:       10,
    sticky:       50,
    nav:          100,
    overlay:      500,
    modalAmbient: 700,   // EspaceVrai
    modalToast:   750,
    modalContent: 760,   // Cocon overlay
    modalDeep:    780,   // PersonalizationModal
    modalCore:    800,   // Cocon principal
    modalReveal:  880,   // RoutineGuide, Breathing
    modalHero:    900,   // PatronusReveal, BreathingModal active
    modalWorld:   950,   // WorldUnlock
    toast:        9500,
    blackout:     9999,
    blackoutTint: 10000,
  },

  // ─── Archétypes — re-export pour cohérence
  archetypes: {
    resilience: { color: '#f59e0b', rgb: '245,158,11',  shadow: 'rgba(245,158,11,0.40)' },
    presence:   { color: '#14b8a6', rgb: '20,184,166',  shadow: 'rgba(20,184,166,0.40)' },
    sagesse:    { color: '#6366f1', rgb: '99,102,241',  shadow: 'rgba(99,102,241,0.40)' },
    lumiere:    { color: '#ec4899', rgb: '236,72,153',  shadow: 'rgba(236,72,153,0.40)' },
  },

  // ─── Typo
  font:   { display: "'Sora', sans-serif", body: "'Inter', sans-serif" },
  weight: { light: 300, regular: 400, medium: 500, semibold: 600 },

  // ─── Couleur de fond canonique
  bg: '#050810',
}

export default tokens
