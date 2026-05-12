// NÉYA — Community system (anonyme, asynchrone, non-toxique)
//
// Architecture backend-ready : les fonctions exportées sont des stubs locaux
// (localStorage + seed data) qui pourront être remplacés par des appels API
// réels (fetch vers Vercel Function / Firebase / etc.) sans changer le code UI.
//
// PHILOSOPHIE : pas de feed, pas de likes, pas de réactions, pas de threads.
// Tu reçois UNE lettre anonyme. Tu peux envoyer UNE lettre (anonyme aussi).
// C'est tout. Comme un message dans une bouteille.

// ─── Seed letters (40) ────────────────────────────────────────
// Lettres réelles qui pourraient être écrites par des utilisateurs.
// Anonymes, courtes (≤200 char), valides cliniquement (validantes,
// pas conseilleuses, pas "positive vibes only").

const SEED_LETTERS = [
  { archetype: 'resilience', text: "Si tu lis ça, c'est que tu es là. Et ça compte. Même si tu ne le crois pas en ce moment.", signature: 'un Phénix, mai' },
  { archetype: 'presence',   text: "J'ai eu peur souvent. Pas tout le temps mais souvent. Et ça passe, vraiment. Promis.", signature: 'un Cerf, avril' },
  { archetype: 'sagesse',    text: "Tu n'es pas obligé·e d'aller mieux pour mériter cet espace. Tu es bien comme tu es ce soir.", signature: 'un Loup, mars' },
  { archetype: 'lumiere',    text: "Quelqu'un d'autre, ailleurs, traverse la même chose ce soir. Tu n'es pas seul·e dedans.", signature: 'un Ours, mai' },
  { archetype: 'resilience', text: "Ta colère est légitime. Elle a quelque chose à dire. Écoute-la sans la presser.", signature: 'un Phénix, février' },
  { archetype: 'presence',   text: "J'ai mis des années à comprendre que respirer suffit parfois. Juste ça. Vraiment.", signature: 'un Cerf, juin' },
  { archetype: 'sagesse',    text: "Tes doutes ne sont pas des défauts. C'est ton intelligence qui te tient en éveil.", signature: 'un Loup, janvier' },
  { archetype: 'lumiere',    text: "Ta sensibilité n'est pas un fardeau. Le monde a besoin de gens qui sentent vraiment.", signature: 'un Ours, octobre' },
  { archetype: 'resilience', text: "J'avais 26 ans quand j'ai compris que j'avais le droit de changer. Toi aussi.", signature: 'un Phénix, mai' },
  { archetype: 'presence',   text: "Le silence n'est pas vide. Il est plein de ce que tu n'as pas encore vu.", signature: 'un Cerf, novembre' },
  { archetype: 'sagesse',    text: "Tu peux pleurer. C'est même un signe que quelque chose en toi se laisse aller à exister.", signature: 'un Loup, mars' },
  { archetype: 'lumiere',    text: "Tu n'as pas à être productif·ve aujourd'hui. Tu es vivant·e, c'est déjà beaucoup.", signature: 'un Ours, août' },
  { archetype: 'resilience', text: "Recommencer n'est pas un échec. C'est ce que font les gens qui ne se résignent pas.", signature: 'un Phénix, juillet' },
  { archetype: 'presence',   text: "J'ai écrit ça depuis mon canapé un soir difficile. Si tu la reçois, prends-la doucement.", signature: 'un Cerf, mai' },
  { archetype: 'sagesse',    text: "Ton chemin n'a pas besoin d'être expliqué pour être légitime.", signature: 'un Loup, février' },
  { archetype: 'lumiere',    text: "J'aurais aimé qu'on me dise plus tôt : ce n'est pas grave de prendre soin de soi en premier.", signature: 'un Ours, septembre' },
  { archetype: 'resilience', text: "Tu fais probablement mieux que tu ne le penses. Vraiment. On est mauvais juges pour nous-mêmes.", signature: 'un Phénix, mars' },
  { archetype: 'presence',   text: "Une petite lumière depuis ailleurs. Sans rien attendre. Juste pour que tu saches qu'elle existe.", signature: 'un Cerf, avril' },
  { archetype: 'sagesse',    text: "Le doute n'est pas l'opposé de la confiance. C'est sa profondeur.", signature: 'un Loup, juin' },
  { archetype: 'lumiere',    text: "Tu n'as pas raté ta vie parce que tu vas mal aujourd'hui. C'est juste aujourd'hui.", signature: 'un Ours, mai' },
  { archetype: 'resilience', text: "J'ai survécu à plus d'hivers que je ne pensais pouvoir. Toi aussi tu vas y arriver.", signature: 'un Phénix, décembre' },
  { archetype: 'presence',   text: "Tu peux poser ce que tu portes. Même une minute. Tout ne dépend pas de toi.", signature: 'un Cerf, septembre' },
  { archetype: 'sagesse',    text: "Personne ne sait vraiment où il va. Les certitudes des autres sont souvent des décors.", signature: 'un Loup, octobre' },
  { archetype: 'lumiere',    text: "Ta créativité t'a sauvé·e plus de fois que tu ne le réalises. Garde-la.", signature: 'un Ours, mars' },
  { archetype: 'resilience', text: "J'ai pleuré dans mon canapé hier. Aujourd'hui je t'écris. Les deux sont vrais.", signature: 'un Phénix, mai' },
  { archetype: 'presence',   text: "Ton calme, quand tu l'as, est une ressource pour tout le monde autour. Y compris toi.", signature: 'un Cerf, février' },
  { archetype: 'sagesse',    text: "Tu n'as pas besoin de comprendre tout de suite pourquoi tu te sens comme ça.", signature: 'un Loup, mai' },
  { archetype: 'lumiere',    text: "Je t'envoie un peu de chaleur. Garde-la, donne-la, ou laisse-la s'envoler. Comme tu veux.", signature: 'un Ours, juin' },
  { archetype: 'resilience', text: "Tomber, ça arrive. Se relever, ça s'apprend. Y compris la millième fois.", signature: 'un Phénix, août' },
  { archetype: 'presence',   text: "Ce soir, si tu peux : pose tes pieds par terre. Sens-les. C'est un point de départ.", signature: 'un Cerf, mars' },
  { archetype: 'sagesse',    text: "Ce que tu ressens en ce moment est une information, pas une vérité finale.", signature: 'un Loup, avril' },
  { archetype: 'lumiere',    text: "Tu n'es pas en retard. Personne ne l'est. Le calendrier des autres ne te concerne pas.", signature: 'un Ours, juillet' },
  { archetype: 'resilience', text: "J'ai longtemps cru que j'étais cassé·e. Aujourd'hui je sais que j'étais juste fatigué·e.", signature: 'un Phénix, juin' },
  { archetype: 'presence',   text: "Tu peux dire non sans te justifier. C'est un acte de soin, pas d'égoïsme.", signature: 'un Cerf, mai' },
  { archetype: 'sagesse',    text: "Tes silences sont aussi importants que tes mots. Parfois plus.", signature: 'un Loup, septembre' },
  { archetype: 'lumiere',    text: "Ce que tu offres au monde, même sans le savoir, est précieux. Surtout quand tu doutes.", signature: 'un Ours, mai' },
  { archetype: 'resilience', text: "Petit rappel : tu n'as pas à être fort·e tout le temps. Pleurer aussi c'est traverser.", signature: 'un Phénix, novembre' },
  { archetype: 'presence',   text: "Si tu lis cette lettre, prends une vraie respiration. Lente. Profonde. Voilà. C'est fait.", signature: 'un Cerf, mai' },
  { archetype: 'sagesse',    text: "Tu peux désaimer ce que tu pensais aimer. Évoluer, c'est ça. C'est OK.", signature: 'un Loup, mai' },
  { archetype: 'lumiere',    text: "Quelqu'un, quelque part, a écrit cette lettre en pensant à un·e inconnu·e. C'était toi.", signature: 'un Ours, mai' },
]

// ─── Mock backend API (localStorage-based) ─────────────────────
// À remplacer par des appels fetch() vers backend réel quand prêt.
//
// API contract attendue (pour future implémentation backend):
//
// GET  /api/letter/random?archetype=X     -> { id, text, signature, archetype }
// POST /api/letter         body { text, archetype } -> { id, queued: true }
// GET  /api/pulse/:archetype             -> { count, lastUpdated }

const RECEIVED_KEY = 'neya_letters_received'
const SENT_KEY = 'neya_letters_sent'

export function getReceivedLetters() {
  try { return JSON.parse(localStorage.getItem(RECEIVED_KEY) || '[]') }
  catch { return [] }
}

export function getSentLetters() {
  try { return JSON.parse(localStorage.getItem(SENT_KEY) || '[]') }
  catch { return [] }
}

// Returns next unread letter (preferring matching archetype, else any)
export function getNextLetter(userArchetype) {
  const received = getReceivedLetters()
  const seenTexts = new Set(received.map(l => l.text))
  const matching = SEED_LETTERS.filter(l => l.archetype === userArchetype && !seenTexts.has(l.text))
  const others = SEED_LETTERS.filter(l => l.archetype !== userArchetype && !seenTexts.has(l.text))
  const pool = matching.length > 0 ? matching : others
  if (pool.length === 0) {
    // Reset — recycler les seed letters si tout lu
    return SEED_LETTERS[Math.floor(Math.random() * SEED_LETTERS.length)]
  }
  return pool[Math.floor(Math.random() * pool.length)]
}

export function markLetterReceived(letter) {
  if (!letter || !letter.text) return false
  try {
    const list = getReceivedLetters()
    if (list.some(l => l.text === letter.text)) return false
    const entry = { ...letter, receivedAt: Date.now() }
    list.push(entry)
    localStorage.setItem(RECEIVED_KEY, JSON.stringify(list.slice(-50)))
    return entry
  } catch { return false }
}

// Local "envoi" — pour MVP sans backend, on enregistre juste localement
// Quand backend prêt, cette fonction fera un POST réel
export function sendLetter(text, archetype) {
  const clean = (text || '').trim().slice(0, 200)
  if (!clean) return null
  try {
    const list = getSentLetters()
    const entry = { ts: Date.now(), text: clean, archetype }
    list.push(entry)
    localStorage.setItem(SENT_KEY, JSON.stringify(list.slice(-30)))
    return entry
  } catch { return null }
}

// ─── Pulse collectif (présence anonyme) ───────────────────────
//
// Simule un nombre d'utilisateurs actifs par archétype.
// Sine wave time-of-day + variance déterministe par jour (pas de randomness
// qui changerait constamment).
//
// Quand backend réel : GET /api/pulse/:archetype renverra le vrai count.

const ARCHETYPE_BASE = {
  resilience: 64,
  presence:   88,
  sagesse:    52,
  lumiere:    74,
}

export function getCollectiveCount(archetype) {
  const base = ARCHETYPE_BASE[archetype] || 60
  const h = new Date().getHours()
  // Sine wave : max à 21h-22h, min à 4h-5h
  const phase = ((h - 4) / 24) * Math.PI * 2
  const wave = Math.sin(phase) * 0.5 + 0.5  // 0 to 1
  const factor = 0.35 + wave * 0.85         // 0.35 to 1.2 of base
  // Déterministe par jour (pas de jitter visuel)
  const today = new Date().toISOString().split('T')[0]
  const seed = today.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const jitter = ((seed * 9301 + 49297) % 233280 / 233280 - 0.5) * 0.2  // ±10%
  return Math.max(8, Math.round(base * factor * (1 + jitter)))
}

// Pluriel archétype pour affichage
export const ARCHETYPE_PLURAL = {
  resilience: 'Phénix',
  presence:   'Cerfs',
  sagesse:    'Loups',
  lumiere:    'Ours',
}

export default { getNextLetter, markLetterReceived, sendLetter, getReceivedLetters, getSentLetters, getCollectiveCount, ARCHETYPE_PLURAL }
