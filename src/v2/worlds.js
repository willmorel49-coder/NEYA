/* ============================================================
   NÉYA V2 — 6 mondes (Studio VØR painterly cosmology)
   ============================================================ */

export const WORLDS = {
  foret: {
    key: 'foret',
    chapter: 1,
    name: 'Forêt de la Clarté',
    totem: 'Lion blanc',
    moment: 'Dawn 5h–8h',
    palette: 'dawn',
    accent: 'var(--amber)',
    accentRgb: 'rgba(212, 168, 120',     // for `${accentRgb}, 0.08)` interpolation
    bg: '/bg-foret.avif',
    emotion: 'Awakening, clarity',
    glyph: 'Lion',
  },
  temple: {
    key: 'temple',
    chapter: 2,
    name: 'Temple des Parts de Soi',
    totem: 'Ours polaire',
    moment: 'Cold morning 8h–11h',
    palette: 'dawn',
    accent: 'var(--moon-blue)',
    accentRgb: 'rgba(143, 164, 212',
    bg: '/bg-vide.avif',
    emotion: 'Introspection, self-acceptance',
    glyph: 'Ours',
  },
  oasis: {
    key: 'oasis',
    chapter: 3,
    name: 'Oasis du Présent',
    totem: 'Aigle céleste',
    moment: 'Full day 12h–14h',
    palette: 'dawn',
    accent: 'var(--peach-light)',
    accentRgb: 'rgba(244, 212, 168',
    bg: '/bg-cosmos.avif',
    emotion: 'Presence, awareness',
    glyph: 'Aigle',
  },
  lac: {
    key: 'lac',
    chapter: 4,
    name: 'Lac des Émotions',
    totem: 'Daim lunaire',
    moment: 'Night 22h–2h',
    palette: 'night',
    accent: 'var(--lavender-lit)',
    accentRgb: 'rgba(195, 190, 239',
    bg: '/bg-eau.avif',
    emotion: 'Feeling, depth',
    glyph: 'Daim',
  },
  montagne: {
    key: 'montagne',
    chapter: 5,
    name: 'Montagne de Vision',
    totem: 'Baleine sage',
    moment: 'Twilight 18h–20h',
    palette: 'night',
    accent: 'var(--deep-purple)',
    accentRgb: 'rgba(61, 47, 107',
    bg: '/bg-cosmos-alt.avif',
    emotion: 'Direction, perspective',
    glyph: 'Baleine',
  },
  communaute: {
    key: 'communaute',
    chapter: 6,
    name: 'Espace Communautaire',
    totem: 'Renard de l’aube',
    moment: 'First light 4h–5h',
    palette: 'dawn',
    accent: 'var(--peach-deep)',
    accentRgb: 'rgba(212, 152, 128',
    bg: '/bg-brume.avif',
    emotion: 'Echo, belonging',
    glyph: 'Renard',
  },
};

export const WORLD_ORDER = ['foret', 'temple', 'oasis', 'lac', 'montagne', 'communaute'];

export function getWorld(key) {
  return WORLDS[key] || WORLDS.foret;
}
