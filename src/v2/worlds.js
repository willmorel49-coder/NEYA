/* ============================================================
   ÇA VA ? V3 — 6 mondes (light-mode, palette ÇA VA? unifiée)
   ============================================================
   Plus de photos full-bleed — chaque monde a son wash pastel
   (radial gradients sur cream) + son accent ÇA VA?.
   ============================================================ */

export const WORLDS = {
  foret: {
    key: 'foret',
    chapter: 1,
    name: 'Forêt de la Clarté',
    totem: 'Lion blanc',
    moment: 'Aube · 5h – 8h',
    palette: 'dawn',
    accent: 'var(--ochre)',
    accentRgb: 'rgba(194, 144, 81',
    wash: 'wash-dawn',
    bg: '/img/world-foret.png',     // painterly Studio VØR illustration
    emotion: 'Éveil, clarté',
    glyph: 'Lion',
  },
  temple: {
    key: 'temple',
    chapter: 2,
    name: 'Temple des Parts de Soi',
    totem: 'Ours polaire',
    moment: 'Matin froid · 8h – 11h',
    palette: 'dawn',
    accent: 'var(--mist-blue)',
    accentRgb: 'rgba(115, 151, 188',
    wash: 'wash-temple',
    bg: '/img/world-temple.png',
    emotion: 'Introspection, acceptation',
    glyph: 'Ours',
  },
  oasis: {
    key: 'oasis',
    chapter: 3,
    name: 'Oasis du Présent',
    totem: 'Aigle céleste',
    moment: 'Plein jour · 12h – 14h',
    palette: 'dawn',
    accent: 'var(--terracotta)',
    accentRgb: 'rgba(159, 88, 76',
    wash: 'wash-oasis',
    bg: '/img/world-oasis.png',
    emotion: 'Présence, conscience',
    glyph: 'Aigle',
  },
  lac: {
    key: 'lac',
    chapter: 4,
    name: 'Lac des Émotions',
    totem: 'Daim lunaire',
    moment: 'Nuit · 22h – 2h',
    palette: 'night',
    accent: '#7B6FA8',
    accentRgb: 'rgba(123, 111, 168',
    wash: 'wash-lac',
    bg: '/img/world-lac.png',
    emotion: 'Ressenti, profondeur',
    glyph: 'Daim',
  },
  montagne: {
    key: 'montagne',
    chapter: 5,
    name: 'Montagne de Vision',
    totem: 'Baleine sage',
    moment: 'Crépuscule · 18h – 20h',
    palette: 'night',
    accent: 'var(--emerald)',
    accentRgb: 'rgba(52, 145, 127',
    wash: 'wash-montagne',
    bg: '/img/world-montagne.png',
    emotion: 'Direction, perspective',
    glyph: 'Baleine',
  },
  communaute: {
    key: 'communaute',
    chapter: 6,
    name: 'Espace Communautaire',
    totem: 'Renard de l’aube',
    moment: 'Première lumière · 4h – 5h',
    palette: 'dawn',
    accent: 'var(--terracotta)',
    accentRgb: 'rgba(159, 88, 76',
    wash: 'wash-renard',
    bg: '/img/world-communaute.png',
    emotion: 'Écho, appartenance',
    glyph: 'Renard',
  },
};

export const WORLD_ORDER = ['foret', 'temple', 'oasis', 'lac', 'montagne', 'communaute'];

export function getWorld(key) {
  return WORLDS[key] || WORLDS.foret;
}
