/* ============================================================
   NÉYA V2 — State + localStorage helpers
   ============================================================
   Namespace : neya_v2_*  (séparé de neya_v1_* legacy)
   ============================================================ */

const NS = 'neya_v2_';

export const haptic = (p) => { try { navigator.vibrate?.(p); } catch {} };

export const greet = () => {
  const h = new Date().getHours();
  if (h < 5) return 'Cette nuit';
  if (h < 12) return 'Bonjour';
  if (h < 18) return 'Bel après-midi';
  if (h < 22) return 'Bonsoir';
  return 'Bonne nuit';
};

export const ls = {
  get(key, def = null) {
    try {
      const v = localStorage.getItem(NS + key);
      return v == null ? def : JSON.parse(v);
    } catch {
      return def;
    }
  },
  set(key, value) {
    try { localStorage.setItem(NS + key, JSON.stringify(value)); } catch {}
  },
  del(key) {
    try { localStorage.removeItem(NS + key); } catch {}
  },
  clear() {
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith(NS))
        .forEach((k) => localStorage.removeItem(k));
    } catch {}
  },
};

/* ============================================================
   User profile schema (V2)
   ============================================================
   {
     pseudo: string | null,
     totem: 'lion' | 'ours' | 'aigle' | 'daim' | 'baleine' | 'renard',
     onboarding: {
       q1_etat: 'pas-terrible' | 'ca-va-je-gere' | 'plutot-bien' | 'je-sais-pas-trop',
       q2_motif: 'stress' | 'sommeil' | 'emotions' | 'curieux',
       q3_minutes: 5 | 10 | 15 | 'plus',
       q4_rythme: 'matin' | 'midi' | 'soir' | 'avant-dormir',
       completed: boolean,
       completedAt: ISO timestamp
     },
     progress: {
       worldsExplored: string[],  // keys de WORLDS
       currentWorld: string,       // key
       joursConnectes: number,
       minutesTotales: number,
       lastVisit: ISO date string
     },
     habits: {
       [worldKey]: {
         [habitId]: { completedAt: ISO timestamp }
       }
     },
     crisis: {
       lastEntryAt: ISO timestamp | null,
       lastExitAt: ISO timestamp | null
     }
   }
   ============================================================ */

export const defaultProfile = () => ({
  pseudo: null,
  totem: 'lion',
  onboarding: { completed: false },
  progress: {
    worldsExplored: [],
    currentWorld: 'foret',
    joursConnectes: 0,
    minutesTotales: 0,
    lastVisit: null,
  },
  habits: {},
  crisis: { lastEntryAt: null, lastExitAt: null },
  cocon: {
    image: null,         // 'foret' | 'temple' | 'oasis' | 'lac' | 'montagne' | 'communaute' | null (suit le totem)
    ambiance: 'fireflies', // 'fireflies' | 'rain' | 'snow' | 'stars' | 'none'
    music: null,         // nom du fichier sans extension, ou null
    musicVolume: 0.45,
  },
  crise: {
    image: 'oasis',          // refuge : 'oasis' | 'lac' | 'foret' | 'temple'
    music: 'sunrise-breath', // 'sunrise-breath' | 'douce-nuit' | 'guéris' | 'tethered-to-the-wreckage' | null
    rhythm: '4-6',           // '4-6' (apaisant) | '5-5' (cohérence) | '4-7-8' (relaxation profonde)
  },
  aventure: {
    image: null,             // 'foret'|'temple'|'oasis'|'lac'|'montagne'|'communaute'|null (suit le totem)
    ambiance: 'fireflies',   // 'fireflies'|'rain'|'snow'|'stars'|'none'
    music: null,             // ÇA VA? tracks ou null
    musicVolume: 0.4,
  },
});

export function getProfile() {
  return ls.get('profile', defaultProfile());
}

export function setProfile(p) {
  ls.set('profile', p);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('neya:profile-changed'));
  }
  return p;
}

export function patchProfile(patch) {
  const p = getProfile();
  const next = { ...p, ...patch };
  setProfile(next);
  return next;
}

export function isOnboarded() {
  return getProfile()?.onboarding?.completed === true;
}

export function recordVisitToday() {
  const p = getProfile();
  const today = new Date().toISOString().split('T')[0];
  const last = p.progress.lastVisit;
  const isNewDay = last !== today;
  if (isNewDay) {
    p.progress.joursConnectes = (p.progress.joursConnectes || 0) + 1;
    p.progress.lastVisit = today;
    setProfile(p);
  }
  return p;
}

export function addMinutes(mins) {
  const p = getProfile();
  p.progress.minutesTotales = (p.progress.minutesTotales || 0) + mins;
  setProfile(p);
  return p;
}

/* ============================================================
   COMPLETION LOOP — méditer dans un monde le débloque + avance
   ============================================================ */

// Ordre canonique des mondes pour l'unlock séquentiel
const WORLD_PROGRESSION = ['foret', 'temple', 'oasis', 'lac', 'montagne', 'communaute'];

export function completeMeditation(worldKey, minutes) {
  const p = getProfile();
  const explored = new Set(p.progress.worldsExplored || []);
  const wasNew = !explored.has(worldKey);
  explored.add(worldKey);
  p.progress.worldsExplored = Array.from(explored);

  // Avance currentWorld au prochain non-exploré dans l'ordre
  const nextUnexplored = WORLD_PROGRESSION.find((w) => !explored.has(w));
  if (nextUnexplored) {
    p.progress.currentWorld = nextUnexplored;
  } else {
    // Tous explorés — reste sur le dernier visité
    p.progress.currentWorld = worldKey;
  }

  if (minutes >= 1) {
    p.progress.minutesTotales = (p.progress.minutesTotales || 0) + minutes;
  }
  setProfile(p);
  return { profile: p, wasNew, advancedTo: nextUnexplored };
}

/* ============================================================
   ONBOARDING ANSWERS WIRING — utilise les 4 réponses dormantes
   ============================================================ */

// q3_minutes : 5 | 10 | 15 | 'plus' → target session length en minutes
export function getOnboardingTargetMinutes() {
  const ob = getProfile().onboarding || {};
  const q = ob.q3_minutes;
  if (q === 5 || q === 10 || q === 15) return q;
  if (q === 'plus') return 999;            // illimité
  return 5;                                  // fallback
}

// q4_rythme + heure : 'dawn' | 'night' palette overlay
export function getPaletteMode() {
  const ob = getProfile().onboarding || {};
  const r = ob.q4_rythme;
  const h = new Date().getHours();
  // Préférence utilisateur prime, heure en fallback
  if (r === 'matin' || r === 'midi') return 'dawn';
  if (r === 'soir' || r === 'avant-dormir') return 'night';
  return h >= 5 && h < 18 ? 'dawn' : 'night';
}

// q2_motif : adapte la wording du CTA principal
const MOTIF_CTA = {
  stress:   'Apaise une minute →',
  sommeil:  'Prépare la nuit →',
  emotions: 'Pose ce qui pèse →',
  curieux:  'Explore un monde →',
};
export function getMotifCTA() {
  const m = getProfile().onboarding?.q2_motif;
  return MOTIF_CTA[m] || 'Continuer la montée →';
}

// q1_etat : micro-line italic sous le greeting Aventure (varie selon ton du jour)
const ETAT_LINE = {
  'pas-terrible':     'Tu peux juste être là. C’est suffisant.',
  'ca-va-je-gere':    'Belle énergie aujourd’hui.',
  'plutot-bien':      'Belle journée à toi.',
  'je-sais-pas-trop': 'Pas besoin de savoir. Pose-toi.',
};
export function getEtatLine() {
  const e = getProfile().onboarding?.q1_etat;
  return ETAT_LINE[e] || null;
}

/* ============================================================
   CRISIS MODE — entry / exit timestamps (safety audit minimum)
   ============================================================ */

export function recordCrisisEntry() {
  const p = getProfile();
  p.crisis = p.crisis || {};
  p.crisis.lastEntryAt = new Date().toISOString();
  setProfile(p);
}

export function recordCrisisExit() {
  const p = getProfile();
  p.crisis = p.crisis || {};
  p.crisis.lastExitAt = new Date().toISOString();
  setProfile(p);
}

/* ============================================================
   HABITUDES DU JOUR — daily reset, persist par date
   ============================================================ */

function todayKey() {
  return new Date().toISOString().split('T')[0];
}

export function getHabitsToday() {
  return ls.get(`habits_${todayKey()}`, {});
}

export function markHabitDone(habitId) {
  const state = getHabitsToday();
  state[habitId] = { completedAt: new Date().toISOString() };
  ls.set(`habits_${todayKey()}`, state);
  return state;
}

export function unmarkHabit(habitId) {
  const state = getHabitsToday();
  delete state[habitId];
  ls.set(`habits_${todayKey()}`, state);
  return state;
}

/* ============================================================
   SOUVENIRS — collected moments from rituals (V1 echo)
   ============================================================
   Schema : { id, ts, type, world, label, detail }
   types : 'meditation' | 'espace-vrai' | 'bilan' | 'world-unlock'
   ============================================================ */

const SOUVENIRS_MAX = 60;

export function addSouvenir({ type, world, label, detail }) {
  const list = ls.get('souvenirs', []);
  const entry = {
    id: Date.now() + '-' + Math.random().toString(36).slice(2, 7),
    ts: Date.now(),
    type,
    world: world || null,
    label,
    detail: detail || null,
  };
  list.unshift(entry);
  if (list.length > SOUVENIRS_MAX) list.length = SOUVENIRS_MAX;
  ls.set('souvenirs', list);
  return entry;
}

export function getSouvenirs() {
  return ls.get('souvenirs', []);
}

export function clearSouvenirs() {
  ls.set('souvenirs', []);
}

/* ============================================================
   MILESTONES — discrete acknowledgments (anti-toxic, no flames)
   ============================================================ */

const MILESTONES = {
  1:   { label: 'Premier pas',     phrase: 'Tu es là. C\'est le plus difficile.' },
  3:   { label: 'Trois jours',     phrase: 'Trois jours d\'affilée. Une habitude commence.' },
  7:   { label: 'Une semaine',     phrase: 'Sept jours. Tu reviens. C\'est ce qui compte.' },
  14:  { label: 'Deux semaines',   phrase: 'Quatorze jours. Ce n\'est plus un hasard.' },
  21:  { label: 'Trois semaines',  phrase: 'Vingt-et-un jours. Tu t\'es appris·e à te poser.' },
  30:  { label: 'Un mois',         phrase: 'Trente jours. Tu t\'es offert·e un mois de présence.' },
  60:  { label: 'Deux mois',       phrase: 'Soixante jours. Un voyage tranquille.' },
  100: { label: 'Cent jours',      phrase: 'Cent jours. Tu connais ton chemin maintenant.' },
};

export function checkMilestone(joursConnectes) {
  return MILESTONES[joursConnectes] || null;
}

export function markMilestoneSeen(day) {
  const seen = ls.get('milestones_seen', []);
  if (!seen.includes(day)) {
    seen.push(day);
    ls.set('milestones_seen', seen);
  }
}

export function isMilestoneSeen(day) {
  return ls.get('milestones_seen', []).includes(day);
}

/* ============================================================
   BILAN HEBDO — weekly reflection (V1 echo)
   ============================================================ */

export function getBilanSemaineHistory() {
  return ls.get('bilan_semaine_history', []);
}

export function saveBilanSemaine(answers) {
  const list = getBilanSemaineHistory();
  list.unshift({
    weekStart: weekStartKey(),
    ts: Date.now(),
    answers,
  });
  if (list.length > 26) list.length = 26;
  ls.set('bilan_semaine_history', list);
}

function weekStartKey() {
  const d = new Date();
  const day = d.getDay() || 7;
  const monday = new Date(d);
  monday.setDate(d.getDate() - (day - 1));
  return monday.toISOString().split('T')[0];
}

export function hasSeenBilanSemaineThisWeek() {
  const list = getBilanSemaineHistory();
  return list.some((b) => b.weekStart === weekStartKey());
}

/* ============================================================
   COMMUNAUTÉ — Daily prompt (rotate par jour, 14 prompts cycle)
   ============================================================ */

const DAILY_PROMPTS = [
  { id: 'p01', q: 'Ce qui pèse sur toi ce matin ?', tag: 'présence' },
  { id: 'p02', q: 'Une chose pour laquelle tu es soulagé·e aujourd’hui ?', tag: 'gratitude' },
  { id: 'p03', q: 'Le mot que personne ne t’a dit récemment ?', tag: 'manque' },
  { id: 'p04', q: 'Ce qui t’a touché·e cette semaine ?', tag: 'tendresse' },
  { id: 'p05', q: 'Quelque chose que tu portes seul·e ?', tag: 'fardeau' },
  { id: 'p06', q: 'Ce qui t’a fait sourire malgré tout ?', tag: 'joie' },
  { id: 'p07', q: 'Une peur que tu n’oses pas nommer ?', tag: 'peur' },
  { id: 'p08', q: 'Tu te sens comment, vraiment, là ?', tag: 'présence' },
  { id: 'p09', q: 'Ce que tu aimerais qu’on te dise ?', tag: 'manque' },
  { id: 'p10', q: 'Un moment où tu as été doux·ce avec toi-même ?', tag: 'tendresse' },
  { id: 'p11', q: 'Ce que tu as cessé d’attendre ?', tag: 'deuil' },
  { id: 'p12', q: 'Une chose vraie qu’il y a dans ta journée ?', tag: 'présence' },
  { id: 'p13', q: 'Ce qui t’aide à respirer quand c’est lourd ?', tag: 'ressource' },
  { id: 'p14', q: 'Tu te sens entendu·e ces temps-ci ?', tag: 'écoute' },
];

export function getDailyPrompt() {
  const day = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  return DAILY_PROMPTS[day % DAILY_PROMPTS.length];
}

/* ============================================================
   CERCLE — close circle of pseudos to send lumières to
   ============================================================ */

export function getCercle() {
  return ls.get('cercle', []);
}

export function addToCercle(pseudo) {
  const list = getCercle();
  if (list.length >= 7) return list;  // cap à 7
  if (!list.find((p) => p.pseudo === pseudo)) {
    list.push({ pseudo, addedAt: Date.now(), lumieresSent: 0 });
    ls.set('cercle', list);
  }
  return list;
}

export function removeFromCercle(pseudo) {
  const list = getCercle().filter((p) => p.pseudo !== pseudo);
  ls.set('cercle', list);
  return list;
}

export function sendLumiere(pseudo) {
  const list = getCercle();
  const p = list.find((x) => x.pseudo === pseudo);
  if (!p) return null;
  const today = new Date().toISOString().split('T')[0];
  p.lumieresSent = (p.lumieresSent || 0) + 1;
  p.lastLumiere = today;
  ls.set('cercle', list);
  return p;
}

export function hasSentLumiereToday(pseudo) {
  const p = getCercle().find((x) => x.pseudo === pseudo);
  if (!p) return false;
  return p.lastLumiere === new Date().toISOString().split('T')[0];
}

export function getLumieresTotal() {
  return getCercle().reduce((s, p) => s + (p.lumieresSent || 0), 0);
}

/* ============================================================
   COMMUNAUTÉ — Crisis keyword detection (soft prompt)
   ============================================================ */

const CRISIS_KEYWORDS = [
  'suicide', 'me tuer', 'me supprimer', 'finir', 'plus envie de vivre',
  'tout abandonner', 'disparaître', 'partir pour de bon',
];

export function detectCrisisKeywords(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  return CRISIS_KEYWORDS.some((kw) => lower.includes(kw));
}

/* ============================================================
   BOUÉES DU JOUR — micro-actions concrètes anti-rumination
   ============================================================
   Inspired by peer-support models (warm-line, body-doubling,
   AA, NAMI peer groups). Tiny wins. Non-toxic.
   ============================================================ */

const BOUEES = [
  { id: 'b01', action: 'Bois trois verres d\'eau, tranquillement.',                level: 'corps',     icon: '◯' },
  { id: 'b02', action: 'Ouvre la fenêtre cinq minutes. Respire.',                  level: 'corps',     icon: '◐' },
  { id: 'b03', action: 'Envoie un message court à une personne aimée.',            level: 'lien',      icon: '♡' },
  { id: 'b04', action: 'Marche dix minutes dehors, sans téléphone.',               level: 'corps',     icon: '↗' },
  { id: 'b05', action: 'Mange quelque chose de simple. Lentement.',                level: 'corps',     icon: '◓' },
  { id: 'b06', action: 'Écris trois lignes dans ton carnet.',                      level: 'esprit',    icon: '✎' },
  { id: 'b07', action: 'Appelle quelqu\'un dont tu n\'as pas eu de nouvelles.',    level: 'lien',      icon: '☎' },
  { id: 'b08', action: 'Range un seul tiroir, un seul.',                           level: 'esprit',    icon: '□' },
  { id: 'b09', action: 'Prends une douche tiède, lentement.',                      level: 'corps',     icon: '◇' },
  { id: 'b10', action: 'Écoute une chanson que tu n\'as plus écoutée depuis longtemps.', level: 'esprit', icon: '♪' },
  { id: 'b11', action: 'Sors prendre un café (ou un thé) hors de chez toi.',       level: 'monde',     icon: '☕' },
  { id: 'b12', action: 'Demande de l\'aide pour une petite chose aujourd\'hui.',   level: 'lien',      icon: '✦' },
  { id: 'b13', action: 'Touche une plante, sens-la.',                              level: 'corps',     icon: '❦' },
  { id: 'b14', action: 'Ne fais rien pendant cinq minutes. Vraiment rien.',        level: 'esprit',    icon: '·' },
];

export function getBoueeDuJour() {
  const day = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  return BOUEES[day % BOUEES.length];
}

export function markBoueeDone(id) {
  const key = `bouee_${new Date().toISOString().split('T')[0]}`;
  const list = ls.get(key, []);
  if (!list.includes(id)) list.push(id);
  ls.set(key, list);
  // Aussi enregistrer comme souvenir
  return list;
}

export function isBoueeDoneToday(id) {
  const key = `bouee_${new Date().toISOString().split('T')[0]}`;
  return ls.get(key, []).includes(id);
}

/* ============================================================
   RITUELS PARTAGÉS CERCLE — shared symbolic gestures
   ============================================================ */

const RITUELS = [
  { id: 'r01', label: 'Allumer une bougie ensemble',  hint: 'À 21h ce soir. Une seule pensée pour ton cercle.', icon: '✺', hour: 21 },
  { id: 'r02', label: 'Marcher en pensée',             hint: 'Cinq minutes dehors. Pense à eux.',                icon: '↗', hour: null },
  { id: 'r03', label: 'Partager une chanson',           hint: 'Une seule, sans explication.',                     icon: '♪', hour: null },
  { id: 'r04', label: 'Envoyer un mot',                 hint: 'Trois lignes. Pour quelqu\'un de ton cercle.',     icon: '✎', hour: null },
  { id: 'r05', label: 'Respirer en commun',             hint: 'À 12h pile. Cinq inspirations.',                   icon: '◯', hour: 12 },
];

export function getRituels() {
  return RITUELS;
}

export function logRituel(rituelId) {
  const key = `rituels_${new Date().toISOString().split('T')[0]}`;
  const list = ls.get(key, []);
  if (!list.includes(rituelId)) list.push(rituelId);
  ls.set(key, list);
  return list;
}

export function isRituelDoneToday(rituelId) {
  const key = `rituels_${new Date().toISOString().split('T')[0]}`;
  return ls.get(key, []).includes(rituelId);
}
