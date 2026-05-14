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
});

export function getProfile() {
  return ls.get('profile', defaultProfile());
}

export function setProfile(p) {
  ls.set('profile', p);
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
