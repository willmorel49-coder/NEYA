// NÉYA — Inner World System
// Système d'attachement émotionnel : souvenirs, ambiance temporelle, vitalité.
// Tout en localStorage — aucun backend.

// ─── Ambiance temporelle ──────────────────────────────────────
//
// Le cocon respire selon l'heure. 4 périodes douces (dawn/morning/dusk/night).
// Retourne une palette + intensité particules + rythme.

export function getTimeAmbience() {
  const h = new Date().getHours()
  let period, primary, secondary, particleOp, rhythm
  if (h >= 5 && h < 9) {
    period = 'dawn'
    primary = 'rgba(245,180,140,0.10)'   // aube — orange pêche très doux
    secondary = 'rgba(255,210,170,0.06)'
    particleOp = 0.10
    rhythm = 0.92                          // animations légèrement plus lentes (apaisé)
  } else if (h >= 9 && h < 17) {
    period = 'day'
    primary = 'rgba(255,255,255,0.06)'    // jour — lumière claire
    secondary = 'rgba(220,230,255,0.04)'
    particleOp = 0.08
    rhythm = 1.0
  } else if (h >= 17 && h < 21) {
    period = 'dusk'
    primary = 'rgba(236,120,180,0.10)'    // crépuscule — magenta doux
    secondary = 'rgba(245,160,120,0.06)'
    particleOp = 0.12
    rhythm = 0.96
  } else {
    period = 'night'
    primary = 'rgba(99,102,241,0.10)'     // nuit — indigo profond
    secondary = 'rgba(60,70,140,0.06)'
    particleOp = 0.14
    rhythm = 0.88                          // animations plus lentes (apaisement)
  }
  return { period, primary, secondary, particleOp, rhythm }
}

export const TIME_LABELS = {
  dawn:    'À l\'aube',
  day:     'En pleine clarté',
  dusk:    'Au crépuscule',
  night:   'Sous la nuit',
}

// ─── Saisonnalité ─────────────────────────────────────────────
//
// Le cocon s'imprègne de la saison du monde extérieur.

export function getSeason() {
  const m = new Date().getMonth() + 1
  if (m >= 3 && m <= 5)  return { key: 'spring', label: 'au printemps', tint: 'rgba(160,220,180,0.05)' }
  if (m >= 6 && m <= 8)  return { key: 'summer', label: 'en été',        tint: 'rgba(255,230,170,0.06)' }
  if (m >= 9 && m <= 11) return { key: 'autumn', label: 'en automne',    tint: 'rgba(220,150,100,0.06)' }
  return                       { key: 'winter', label: 'en hiver',       tint: 'rgba(170,200,240,0.06)' }
}

// ─── Météo intérieure ──────────────────────────────────────────
//
// Reflète l'énergie intérieure visuellement. 3 modes, déterminés par la vitalité.
//   - vitalité < 0.30 : "brume" — particules très lentes, voile doux (le monde se repose)
//   - vitalité 0.30-0.65 : "claire" — neutre, particules modérées
//   - vitalité > 0.65 : "lueurs" — petites lumières flottantes additionnelles
//
// Pas culpabilisant : la brume n'est pas un échec — c'est le monde qui se met en pause.

export function getMeteo(vitality) {
  if (vitality < 0.30) return { key: 'brume',  label: 'se repose',  intensity: 1 - vitality }
  if (vitality > 0.65) return { key: 'lueurs', label: 'rayonne',    intensity: (vitality - 0.65) / 0.35 }
  return                     { key: 'claire', label: 'respire',    intensity: 0.5 }
}

// ─── Visiteurs paisibles ──────────────────────────────────────
//
// Le cocon est parfois traversé par une présence : étoile filante (nuit) ou papillon (jour).
// Apparition rare, seed basé sur la date (1× chance/jour ~15% selon vitalité).

export function getVisitor(period, vitality) {
  try {
    const today = new Date().toISOString().split('T')[0]
    const lastVisitKey = `neya_visitor_${today}`
    const already = localStorage.getItem(lastVisitKey)
    if (already === 'shown') return null

    // Seed déterministe basé sur la date
    const seed = today.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
    const roll = (seed * 9301 + 49297) % 233280 / 233280   // 0-1 deterministic
    const chance = 0.12 + vitality * 0.20                    // 12% base, jusqu'à 32% si vitalité haute

    if (roll < chance) {
      const visitor = (period === 'night' || period === 'dusk') ? 'shooting_star' : 'butterfly'
      localStorage.setItem(lastVisitKey, 'shown')
      return visitor
    }
    return null
  } catch { return null }
}

// ─── Solstice / Équinoxe — éclats astronomiques ──────────────
//
// Détecte les périodes solstice ±2 jours et offre un souvenir rare 1× / saison.

export function checkAstroEclat() {
  try {
    const now = new Date()
    const m = now.getMonth() + 1
    const d = now.getDate()
    let key = null
    if (m === 6 && d >= 19 && d <= 23)        key = 'solstice_summer'
    else if (m === 12 && d >= 19 && d <= 23)  key = 'solstice_winter'
    else if (m === 3 && d >= 19 && d <= 23)   key = 'equinox_spring'
    else if (m === 9 && d >= 20 && d <= 24)   key = 'equinox_autumn'
    return key
  } catch { return null }
}

// ─── Vitalité du monde ────────────────────────────────────────
//
// 0 à 1, basée sur l'activité récente.
// L'idée : si l'utilisateur respire, agit, fait son rituel — le monde a plus d'énergie.
// S'il n'est pas venu depuis 4 jours — le monde devient plus calme.

export function getCoconVitality() {
  try {
    // Composante 1 : sessions de breath récentes (7 derniers jours)
    const sessions = JSON.parse(localStorage.getItem('neya_breath_sessions') || '[]')
    const weekAgo = Date.now() - 7 * 86400000
    const recentBreath = sessions.filter(s => s && s.ts && s.ts > weekAgo).length
    const breathScore = Math.min(1, recentBreath / 6)  // 6 sessions/sem = max

    // Composante 2 : jours actifs récents (7 derniers jours)
    let activeDays = 0
    const today = new Date()
    for (let i = 0; i < 7; i++) {
      const d = new Date(today); d.setDate(d.getDate() - i)
      const key = `neya_routines_${d.toISOString().split('T')[0]}`
      try {
        if (JSON.parse(localStorage.getItem(key) || '[]').some(Boolean)) activeDays++
      } catch {}
    }
    const activeScore = activeDays / 7

    // Composante 3 : mood delta moyen sur les sessions
    const recent = sessions.slice(-10).filter(s => typeof s.moodEnd === 'number' && typeof s.moodStart === 'number')
    const avgDelta = recent.length > 0
      ? recent.reduce((sum, s) => sum + (s.moodEnd - s.moodStart), 0) / recent.length
      : 0
    const moodScore = Math.max(0, Math.min(1, (avgDelta + 2) / 6))  // -2 → 0, +4 → 1

    // Pondération
    return Math.max(0, Math.min(1,
      breathScore * 0.35 +
      activeScore * 0.45 +
      moodScore   * 0.20
    ))
  } catch {
    return 0.4   // valeur médiane par défaut
  }
}

// ─── Souvenirs — collectibles émotionnels ─────────────────────
//
// Pas des achievements à compter. Des moments à conserver.
// Stockés en localStorage : { ts, type, payload? }
// Maximum 30 (rotation). Premier ajout d'un type = c'est lui qu'on garde.

const SOUVENIRS_KEY = 'neya_souvenirs'

// Bibliothèque de souvenirs nameables.
// Chaque entrée : un titre poétique + un glyph.
export const SOUVENIR_LIBRARY = {
  first_visit:        { glyph: '◈', title: 'Première venue',           subtitle: 'Tu as poussé la porte.' },
  first_cocon:        { glyph: '◎', title: 'Ton premier cocon',         subtitle: "L'espace t'a accueilli·e." },
  first_breath:       { glyph: '◇', title: 'Ton premier souffle',       subtitle: 'Une respiration intentionnelle.' },
  first_mood_lift:    { glyph: '✦', title: 'Premier mieux-être',        subtitle: 'Le souffle a allégé quelque chose.' },
  first_routine:      { glyph: '◊', title: 'Première routine',          subtitle: 'Un geste posé pour toi.' },
  first_quete:        { glyph: '✧', title: 'Première quête',            subtitle: 'Tu es allé·e plus loin.' },
  first_espace_vrai:  { glyph: '◯', title: 'Premier Espace Vrai',       subtitle: 'Tu es resté·e dans la présence.' },
  milestone_3:        { glyph: '✦', title: '3 jours d\'affilée',         subtitle: 'Une constance naissante.' },
  milestone_7:        { glyph: '✦', title: 'Une semaine entière',       subtitle: 'Un rythme prend forme.' },
  milestone_14:       { glyph: '✦', title: 'Deux semaines',              subtitle: 'C\'est devenu naturel.' },
  milestone_30:       { glyph: '✦', title: 'Un mois complet',            subtitle: 'Tu as construit quelque chose.' },
  milestone_60:       { glyph: '✦', title: 'Deux mois',                  subtitle: 'Phénoménal.' },
  milestone_100:      { glyph: '✦', title: '100 jours',                  subtitle: 'Ta lumière brûle constamment.' },
  item_bougie:        { glyph: '⊙', title: 'La Bougie t\'a rejoint·e',   subtitle: 'Flamme intérieure placée.' },
  item_cristal:       { glyph: '⟁', title: 'Le Cristal s\'est allumé',   subtitle: 'Clarté ancrée.' },
  item_plante:        { glyph: '⚘', title: 'La Plante a poussé',         subtitle: 'Quelque chose grandit.' },
  item_totem:         { glyph: '◈', title: 'Ton Totem veille',           subtitle: 'L\'animal-esprit est là.' },
  item_portail:       { glyph: '◉', title: 'Le Portail s\'est ouvert',   subtitle: 'Vers ce qui vient.' },
  world_unlock:       { glyph: '◌', title: 'Un nouveau monde',           subtitle: 'Ton univers s\'élargit.' },
  archetype_revealed: { glyph: '◈', title: 'Ton archétype révélé',      subtitle: '' },
  solstice_summer:    { glyph: '☀', title: 'Solstice d\'été',            subtitle: 'Le jour le plus long t\'a trouvé·e ici.' },
  solstice_winter:    { glyph: '❄', title: 'Solstice d\'hiver',          subtitle: 'La nuit la plus longue, et toi en présence.' },
  equinox_spring:     { glyph: '☽', title: 'Équinoxe de printemps',     subtitle: 'Le monde renaît, toi aussi.' },
  equinox_autumn:     { glyph: '☾', title: 'Équinoxe d\'automne',       subtitle: 'Le temps de se déposer.' },
  visitor_butterfly:  { glyph: '⌒', title: 'Un papillon est passé',     subtitle: 'Tu l\'as juste vu.' },
  visitor_shooting:   { glyph: '⋆', title: 'Une étoile filante',        subtitle: 'Le ciel a brillé pour toi.' },
  first_liberation:   { glyph: '◍', title: 'Première libération',       subtitle: 'Tu as posé ce qui pesait.' },
  liberation_session: { glyph: '◍', title: 'Pensées libérées',          subtitle: 'L\'espace s\'est éclairci.' },
  first_apaisement:   { glyph: '◌', title: 'Premier apaisement',         subtitle: 'Tu as touché à douze présences.' },
  apaisement_session: { glyph: '◌', title: 'Apaisement sensoriel',       subtitle: 'Le corps est revenu au présent.' },
  first_cercle:       { glyph: '◐', title: 'Premier cercle',              subtitle: 'Tu portes quelqu\'un en intention.' },
  first_lumiere:      { glyph: '✦', title: 'Première lumière envoyée',    subtitle: 'Un geste invisible vers un·e proche.' },
  lumiere_session:    { glyph: '✦', title: 'Lumière partagée',            subtitle: 'Tu as pensé à quelqu\'un avec soin.' },
  first_invite:       { glyph: '◈', title: 'Première invitation',         subtitle: 'Tu as ouvert une porte.' },
  first_carnet:       { glyph: '◊', title: 'Première page du Carnet',     subtitle: 'Tu as déposé un mot pour toi.' },
  carnet_week:        { glyph: '◊', title: 'Une semaine d\'écriture',     subtitle: '7 jours, 7 traces.' },
  first_letter_received: { glyph: '✉', title: 'Première lettre reçue',   subtitle: 'Quelqu\'un t\'a écrit, sans te connaître.' },
  first_letter_sent:  { glyph: '✉', title: 'Première lettre envoyée',     subtitle: 'Tu as confié un mot au silence.' },
  first_quick_mood:   { glyph: '◐', title: 'Première écoute de soi',      subtitle: 'Tu as nommé ce que tu ressens.' },
  mood_week:          { glyph: '◐', title: 'Une semaine d\'écoute',       subtitle: 'Sept jours à te regarder doucement.' },
  first_concentration:{ glyph: '◉', title: 'Première concentration',      subtitle: 'Tu as ramené ton attention.' },
  concentration_complete: { glyph: '◉', title: 'Attention soutenue',      subtitle: 'Soixante secondes de présence focalisée.' },
  first_reparation:   { glyph: '◈', title: 'Première réparation',         subtitle: 'Tu as commencé à rassembler.' },
  reparation_complete:{ glyph: '◈', title: 'Cocon entier',                 subtitle: 'Toutes les pièces ont retrouvé leur place.' },
  first_jardin:       { glyph: '⚘', title: 'Premier passage au Jardin',   subtitle: 'Quelque chose pousse ici.' },
  jardin_florissant:  { glyph: '⚘', title: 'Jardin florissant',           subtitle: 'Sept jours et le sol s\'éveille.' },
}

// ─── Cercle de présence ──────────────────────────────────────
//
// Jusqu'à 3 proches portés en intention. Pas un réseau social, pas une liste
// d'amis. Un acte rituel d'évocation.
// Stockés en localStorage uniquement (privé, jamais transmis).

const CERCLE_KEY = 'neya_cercle'

export function getCercle() {
  try { return JSON.parse(localStorage.getItem(CERCLE_KEY) || '[]') }
  catch { return [] }
}

export function addToCercle(prenom) {
  const trimmed = (prenom || '').trim().slice(0, 30)
  if (!trimmed) return false
  try {
    const list = getCercle()
    if (list.length >= 3) return false
    if (list.some(p => p.prenom.toLowerCase() === trimmed.toLowerCase())) return false
    const next = [...list, { prenom: trimmed, addedAt: Date.now() }]
    localStorage.setItem(CERCLE_KEY, JSON.stringify(next))
    return true
  } catch { return false }
}

export function removeFromCercle(prenom) {
  try {
    const list = getCercle()
    const next = list.filter(p => p.prenom !== prenom)
    localStorage.setItem(CERCLE_KEY, JSON.stringify(next))
    return true
  } catch { return false }
}

// Vérifie si une lumière a déjà été envoyée à cette personne aujourd'hui
export function hasSentLumiereToday(prenom) {
  try {
    const today = new Date().toISOString().split('T')[0]
    const key = `neya_lumiere_${prenom}_${today}`
    return !!localStorage.getItem(key)
  } catch { return false }
}

// Marque une lumière envoyée (rituel local, jamais transmis automatiquement)
export function sendLumiere(prenom) {
  if (!prenom) return false
  if (hasSentLumiereToday(prenom)) return false
  try {
    const today = new Date().toISOString().split('T')[0]
    localStorage.setItem(`neya_lumiere_${prenom}_${today}`, String(Date.now()))
    // Compteur global
    const totalKey = 'neya_lumieres_total'
    const total = parseInt(localStorage.getItem(totalKey) || '0', 10) + 1
    localStorage.setItem(totalKey, String(total))
    return true
  } catch { return false }
}

export function getLumieresTotal() {
  try { return parseInt(localStorage.getItem('neya_lumieres_total') || '0', 10) }
  catch { return 0 }
}

// ─── Carnet du Voyage — note quotidienne ──────────────────────
//
// Un espace d'écriture libre par jour. Max 200 caractères (twitter-like,
// encourage la condensation). Max 90 entrées (3 mois rolling).
// Stockage: array de { ts, date: 'YYYY-MM-DD', text } trié chronologique.

const CARNET_KEY = 'neya_carnet'
const CARNET_MAX_LEN = 200
const CARNET_MAX_ENTRIES = 90

export function getCarnetEntries() {
  try { return JSON.parse(localStorage.getItem(CARNET_KEY) || '[]') }
  catch { return [] }
}

export function getCarnetEntryForDate(dateStr) {
  return getCarnetEntries().find(e => e.date === dateStr) || null
}

export function getCarnetEntryToday() {
  const today = new Date().toISOString().split('T')[0]
  return getCarnetEntryForDate(today)
}

export function saveCarnetEntry(text) {
  const clean = (text || '').trim().slice(0, CARNET_MAX_LEN)
  const today = new Date().toISOString().split('T')[0]
  try {
    const list = getCarnetEntries()
    const idx = list.findIndex(e => e.date === today)
    if (clean === '') {
      // Suppression : si vide, on retire l'entrée du jour
      if (idx >= 0) {
        list.splice(idx, 1)
        localStorage.setItem(CARNET_KEY, JSON.stringify(list))
      }
      return null
    }
    const entry = { ts: Date.now(), date: today, text: clean }
    if (idx >= 0) list[idx] = entry
    else list.push(entry)
    // Sort + truncate
    list.sort((a, b) => (a.ts || 0) - (b.ts || 0))
    const trimmed = list.slice(-CARNET_MAX_ENTRIES)
    localStorage.setItem(CARNET_KEY, JSON.stringify(trimmed))
    return entry
  } catch { return null }
}

// ─── Mood data extraction ─────────────────────────────────────
//
// Extrait les sessions de breath avec moodStart/moodEnd renseignés.
// Retourne array trié par ts, max N items.

export function getMoodHistory(limit = 14) {
  try {
    const sessions = JSON.parse(localStorage.getItem('neya_breath_sessions') || '[]')
    return sessions
      .filter(s => s && typeof s.moodEnd === 'number' && typeof s.moodStart === 'number' && s.ts)
      .slice(-limit)
      .map(s => ({ ts: s.ts, before: s.moodStart, after: s.moodEnd, delta: s.moodEnd - s.moodStart, source: 'breath' }))
  } catch { return [] }
}

// ─── Quick mood (1-tap check sans modal) ──────────────────────
//
// Échelle 1-5 (lourd / difficile / neutre / bien / lumineux).
// Un seul check par jour (le dernier compte si re-tap).
// Compatible avec MoodGraph : exposé comme {ts, after: scaled10}.

export function setMoodQuick(value) {
  if (typeof value !== 'number' || value < 1 || value > 5) return false
  try {
    const today = new Date().toISOString().split('T')[0]
    const key = `neya_mood_quick_${today}`
    localStorage.setItem(key, JSON.stringify({ value, ts: Date.now() }))
    return true
  } catch { return false }
}

export function getMoodQuickToday() {
  try {
    const today = new Date().toISOString().split('T')[0]
    const raw = localStorage.getItem(`neya_mood_quick_${today}`)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function getMoodQuickHistory(days = 14) {
  const out = []
  try {
    const today = new Date()
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today); d.setDate(d.getDate() - i)
      const ds = d.toISOString().split('T')[0]
      const raw = localStorage.getItem(`neya_mood_quick_${ds}`)
      if (raw) {
        try {
          const parsed = JSON.parse(raw)
          // Scale 1-5 → 1-10 pour cohérence avec MoodGraph
          out.push({ ts: parsed.ts, after: parsed.value * 2, source: 'quick' })
        } catch {}
      }
    }
  } catch {}
  return out
}

// Combine breath + quick mood pour MoodGraph
export function getMoodCombined(limit = 14) {
  const breath = getMoodHistory(limit * 2)
  const quick = getMoodQuickHistory(limit * 2)
  const combined = [...breath, ...quick].sort((a, b) => a.ts - b.ts)
  return combined.slice(-limit)
}

// Count consecutive days with at least 1 quick mood logged
export function getMoodQuickStreak() {
  let streak = 0
  try {
    const today = new Date()
    for (let i = 0; i < 90; i++) {
      const d = new Date(today); d.setDate(d.getDate() - i)
      const ds = d.toISOString().split('T')[0]
      if (localStorage.getItem(`neya_mood_quick_${ds}`)) streak++
      else if (i > 0) break
      else continue // today not done is OK
    }
  } catch {}
  return streak
}

export function getSouvenirs() {
  try { return JSON.parse(localStorage.getItem(SOUVENIRS_KEY) || '[]') }
  catch { return [] }
}

export function addSouvenir(type, payload = {}) {
  if (!SOUVENIR_LIBRARY[type]) return null
  try {
    const list = getSouvenirs()
    // Anti-doublon par type pour les "premières"
    if (type.startsWith('first_') && list.some(s => s.type === type)) return null
    if (type.startsWith('milestone_') && list.some(s => s.type === type)) return null
    if (type.startsWith('item_') && list.some(s => s.type === type)) return null
    if (type === 'archetype_revealed' && list.some(s => s.type === type)) return null

    const entry = { ts: Date.now(), type, ...payload }
    const next = [...list, entry].slice(-30)  // garde 30 plus récents
    localStorage.setItem(SOUVENIRS_KEY, JSON.stringify(next))
    return entry
  } catch { return null }
}

export function formatSouvenirDate(ts) {
  try {
    const d = new Date(ts)
    const months = ['janv.', 'févr.', 'mars', 'avril', 'mai', 'juin',
                    'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']
    return `${d.getDate()} ${months[d.getMonth()]}`
  } catch { return '' }
}

export default { getTimeAmbience, getCoconVitality, getSouvenirs, addSouvenir, SOUVENIR_LIBRARY, TIME_LABELS, formatSouvenirDate, getCercle, addToCercle, removeFromCercle, sendLumiere, hasSentLumiereToday, getLumieresTotal }
