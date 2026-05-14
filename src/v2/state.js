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
