// ÇA VA ? — Sound design system (Web Audio API, procédural)
//
// Philosophie : zéro fichier audio. Tout est synthétisé à la volée.
// Léger (0 KB de poids réseau), accessible, modulable.
//
// Règles d'or :
//   1. OFF par défaut — respect du silence par défaut.
//   2. Mute pendant `prefers-reduced-motion` (les audio-anxieux le réclament aussi).
//   3. Aucun autoplay long. Tout son est < 2s.
//   4. Master gain bas (-12 dB / 0.25).
//   5. Sons synthétisés en accords harmonieux (pentatonique japonais, intervalles consonants).

const CONSENT_KEY = 'neya_audio_enabled'

let ctx = null
let masterGain = null
let initialized = false

// Pentatonique majeure C (apaisante, contemplative) — Do Ré Mi Sol La
const PENTATONIC = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00, 987.77, 1046.50]

// ─── Init lazy (1er user gesture) ──────────────────────────────

function isEnabled() {
  try { return localStorage.getItem(CONSENT_KEY) === 'yes' } catch { return false }
}

export function setAudioEnabled(value /* boolean */) {
  try { localStorage.setItem(CONSENT_KEY, value ? 'yes' : 'no') } catch {}
  if (value && !ctx) ensureContext()
  if (ctx) {
    // Smooth volume change
    const target = value ? 0.25 : 0
    if (masterGain) masterGain.gain.setTargetAtTime(target, ctx.currentTime, 0.05)
  }
}

export function getAudioEnabled() {
  return isEnabled()
}

function ensureContext() {
  if (ctx) return ctx
  try {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    ctx = new AC()
    masterGain = ctx.createGain()
    masterGain.gain.value = isEnabled() ? 0.25 : 0
    masterGain.connect(ctx.destination)
    initialized = true
    return ctx
  } catch { return null }
}

// Resume context if suspended (Safari/Chrome autoplay policy)
function resume() {
  if (!ctx) ensureContext()
  if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {})
}

// ─── Sound primitives ──────────────────────────────────────────

function _tone({ freq, type = 'sine', attack = 0.005, decay = 0.18, peak = 0.10, sustain = 0, release = 0.05 }) {
  if (!isEnabled()) return
  resume()
  if (!ctx || !masterGain) return
  const o = ctx.createOscillator()
  const g = ctx.createGain()
  o.type = type
  o.frequency.value = freq
  const t = ctx.currentTime
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(peak, t + attack)
  if (sustain > 0) {
    g.gain.linearRampToValueAtTime(peak * 0.65, t + attack + decay)
    g.gain.setValueAtTime(peak * 0.65, t + attack + decay + sustain)
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay + sustain + release)
  } else {
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay)
  }
  o.connect(g).connect(masterGain)
  o.start(t)
  o.stop(t + attack + decay + sustain + release + 0.05)
}

function _bell({ freq, decay = 1.4, peak = 0.08 }) {
  if (!isEnabled()) return
  resume()
  if (!ctx || !masterGain) return
  const t = ctx.currentTime
  // Fundamental + inharmonic partials (bell-like)
  const partials = [
    { ratio: 1.0,  gain: 1.0,  decay: decay        },
    { ratio: 2.4,  gain: 0.42, decay: decay * 0.7  },
    { ratio: 3.7,  gain: 0.18, decay: decay * 0.5  },
    { ratio: 5.2,  gain: 0.08, decay: decay * 0.35 },
  ]
  partials.forEach(p => {
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'sine'
    o.frequency.value = freq * p.ratio
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(peak * p.gain, t + 0.004)
    g.gain.exponentialRampToValueAtTime(0.0001, t + p.decay)
    o.connect(g).connect(masterGain)
    o.start(t)
    o.stop(t + p.decay + 0.05)
  })
}

function _swell({ freqStart, freqEnd, duration = 0.6, peak = 0.06 }) {
  if (!isEnabled()) return
  resume()
  if (!ctx || !masterGain) return
  const t = ctx.currentTime
  const o = ctx.createOscillator()
  const g = ctx.createGain()
  o.type = 'sine'
  o.frequency.setValueAtTime(freqStart, t)
  o.frequency.exponentialRampToValueAtTime(freqEnd, t + duration)
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(peak, t + duration * 0.45)
  g.gain.exponentialRampToValueAtTime(0.0001, t + duration)
  o.connect(g).connect(masterGain)
  o.start(t)
  o.stop(t + duration + 0.05)
}

function _noise({ duration = 0.6, peak = 0.04, filterFreqStart = 800, filterFreqEnd = 1600, Q = 1.2 }) {
  if (!isEnabled()) return
  resume()
  if (!ctx || !masterGain) return
  const t = ctx.currentTime
  const bufferSize = Math.round(ctx.sampleRate * duration)
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.6
  const src = ctx.createBufferSource()
  src.buffer = buffer
  const filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.Q.value = Q
  filter.frequency.setValueAtTime(filterFreqStart, t)
  filter.frequency.linearRampToValueAtTime(filterFreqEnd, t + duration)
  const g = ctx.createGain()
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(peak, t + duration * 0.3)
  g.gain.linearRampToValueAtTime(peak * 0.5, t + duration * 0.7)
  g.gain.exponentialRampToValueAtTime(0.0001, t + duration)
  src.connect(filter).connect(g).connect(masterGain)
  src.start(t)
  src.stop(t + duration + 0.05)
}

// ─── Sons publics — ÇA VA ? library ───────────────────────────────

// Tap UI — soft sine ping at 880 Hz
export function playTap() {
  _tone({ freq: 880, type: 'sine', attack: 0.003, decay: 0.16, peak: 0.06 })
}

// Confirm — 2-note ascending interval (perfect 5th)
export function playConfirm() {
  _tone({ freq: 523.25, type: 'sine', decay: 0.22, peak: 0.07 })
  setTimeout(() => _tone({ freq: 783.99, type: 'sine', decay: 0.32, peak: 0.07 }), 80)
}

// Souvenir collected — 3-note arpeggio
export function playSouvenir() {
  const notes = [523.25, 659.25, 783.99]
  notes.forEach((f, i) => setTimeout(() => _bell({ freq: f, decay: 1.2, peak: 0.06 }), i * 110))
}

// Dot chime — Apaisement sensoriel, plays a note from pentatonic scale
export function playChime(index = 0) {
  const f = PENTATONIC[index % PENTATONIC.length]
  _bell({ freq: f, decay: 1.0, peak: 0.05 })
}

// Liberation release — descending dissolve (un poids qui tombe)
export function playRelease() {
  _swell({ freqStart: 660, freqEnd: 220, duration: 0.55, peak: 0.05 })
  _noise({ duration: 0.5, peak: 0.025, filterFreqStart: 1200, filterFreqEnd: 400, Q: 0.8 })
}

// Breath inhale — filtered noise swell up
export function playBreathIn(durationS = 4) {
  _noise({ duration: durationS, peak: 0.03, filterFreqStart: 400, filterFreqEnd: 1400, Q: 0.6 })
}

// Breath exhale — filtered noise descent
export function playBreathOut(durationS = 4) {
  _noise({ duration: durationS, peak: 0.03, filterFreqStart: 1400, filterFreqEnd: 300, Q: 0.6 })
}

// Modal open — soft ascending swell
export function playOpen() {
  _swell({ freqStart: 220, freqEnd: 440, duration: 0.4, peak: 0.04 })
}

// Modal close — descending swell
export function playClose() {
  _swell({ freqStart: 440, freqEnd: 220, duration: 0.32, peak: 0.035 })
}

// Milestone — major triad pad chord (C E G), slow attack, sustained
export function playMilestone() {
  const t = isEnabled() && ctx ? ctx.currentTime : 0
  ;[261.63, 329.63, 392.00, 523.25].forEach((f, i) => {
    setTimeout(() => _tone({
      freq: f, type: 'sine',
      attack: 0.18, decay: 0.4, peak: 0.06,
      sustain: 1.6, release: 0.8,
    }), i * 60)
  })
}

// ─── Ambient drone (Cocon) ─────────────────────────────────────
// Texture sonore basse, sustained, archetype-colorée. Fade in 4s,
// fade out 2s. Bandpass noise LFO-modulated pour qualité respirante.
// Volume très bas (~0.06) — c'est une présence, pas un son.

let droneState = null  // { oscs: [], noise, noiseGain, filter, mainGain, lfoOsc, lfoGain }

const DRONE_PROFILES = {
  resilience: { f1: 82.41,  f2: 123.47, lfoRate: 0.13, lfoDepth: 240, filterBase: 380, filterPeak: 720, peak: 0.058, qFilter: 1.2 },
  presence:   { f1: 73.42,  f2: 110.00, lfoRate: 0.08, lfoDepth: 180, filterBase: 320, filterPeak: 540, peak: 0.052, qFilter: 1.0 },
  sagesse:    { f1: 77.78,  f2: 116.54, lfoRate: 0.06, lfoDepth: 160, filterBase: 340, filterPeak: 600, peak: 0.048, qFilter: 0.9 },
  lumiere:    { f1: 92.50,  f2: 138.59, lfoRate: 0.16, lfoDepth: 280, filterBase: 420, filterPeak: 840, peak: 0.064, qFilter: 1.4 },
}

export function startCoconAmbience(archetypeKey = 'presence') {
  if (!isEnabled()) return
  if (droneState) stopCoconAmbience(true)
  resume()
  if (!ctx || !masterGain) return

  const profile = DRONE_PROFILES[archetypeKey] || DRONE_PROFILES.presence
  const t = ctx.currentTime

  // Main gain (fade in)
  const mainGain = ctx.createGain()
  mainGain.gain.setValueAtTime(0, t)
  mainGain.gain.linearRampToValueAtTime(profile.peak, t + 4)
  mainGain.connect(masterGain)

  // 2 low oscillators in fifth interval
  const oscs = []
  ;[profile.f1, profile.f2].forEach((freq, i) => {
    const o = ctx.createOscillator()
    o.type = i === 0 ? 'sine' : 'triangle'
    o.frequency.value = freq
    const og = ctx.createGain()
    og.gain.value = i === 0 ? 1.0 : 0.42
    o.connect(og).connect(mainGain)
    o.start(t)
    oscs.push(o)
  })

  // Filtered noise texture
  const bufferSize = 2 * ctx.sampleRate
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = noiseBuffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1
  const noise = ctx.createBufferSource()
  noise.buffer = noiseBuffer
  noise.loop = true
  const filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = profile.filterBase
  filter.Q.value = profile.qFilter
  const noiseGain = ctx.createGain()
  noiseGain.gain.value = 0.18  // relative to mainGain
  noise.connect(filter).connect(noiseGain).connect(mainGain)
  noise.start(t)

  // LFO on filter frequency (breathing quality)
  const lfoOsc = ctx.createOscillator()
  lfoOsc.frequency.value = profile.lfoRate
  const lfoGain = ctx.createGain()
  lfoGain.gain.value = profile.lfoDepth
  lfoOsc.connect(lfoGain).connect(filter.frequency)
  lfoOsc.start(t)

  droneState = { oscs, noise, noiseGain, filter, mainGain, lfoOsc, lfoGain }
}

export function stopCoconAmbience(immediate = false) {
  if (!droneState || !ctx) return
  const t = ctx.currentTime
  const fadeDur = immediate ? 0.15 : 2.0
  try {
    droneState.mainGain.gain.cancelScheduledValues(t)
    droneState.mainGain.gain.setValueAtTime(droneState.mainGain.gain.value, t)
    droneState.mainGain.gain.linearRampToValueAtTime(0, t + fadeDur)
  } catch {}
  const state = droneState
  droneState = null
  setTimeout(() => {
    try { state.oscs.forEach(o => o.stop()) } catch {}
    try { state.noise.stop() } catch {}
    try { state.lfoOsc.stop() } catch {}
  }, (fadeDur * 1000) + 100)
}

export function isCoconAmbiencePlaying() {
  return droneState !== null
}

// ─── Ambient MP3 layer (V3.1 — tracks émotionnels Will) ────────────
// 11 tracks composés par Will, jouées en fond très doux (gain ≤0.12).
// Toggle séparé du UI sounds (neya_ambient_enabled). OFF par défaut.
// Crossfade équal-power approximé, lazy fetch + decode, cache mémoire.
//
// Mutuellement exclusif avec startCoconAmbience (drone synthétique).

const AMBIENT_CONSENT_KEY = 'neya_ambient_enabled'
const AMBIENT_BASE = '/musique/'
const AMBIENT_TRACKS = {
  silencieuse:    { file: 'silencieuse.mp3',              gain: 0.10, fadeIn: 8, fadeOut: 4, pan:  0.00 },
  monCoeur:       { file: 'mon-cœur.mp3',                 gain: 0.11, fadeIn: 6, fadeOut: 3, pan: -0.10 },
  entreTension:   { file: 'entre-tension-et-douceur.mp3', gain: 0.10, fadeIn: 5, fadeOut: 3, pan:  0.00 },
  surMaPlanete:   { file: 'sur-ma-planète.mp3',           gain: 0.12, fadeIn: 8, fadeOut: 4, pan:  0.05 },
  ceQuiReste:     { file: 'ce-qui-reste 2.mp3',           gain: 0.10, fadeIn: 6, fadeOut: 4, pan: -0.05 },
  caVa:           { file: 'ça-va.mp3',                    gain: 0.09, fadeIn: 6, fadeOut: 3, pan:  0.00 },
  souffleCourt:   { file: 'souffle-court.mp3',            gain: 0.10, fadeIn: 4, fadeOut: 2, pan:  0.00 },
  masque:         { file: 'Masque.mp3',                   gain: 0.08, fadeIn: 5, fadeOut: 3, pan:  0.10 },
  debordement:    { file: 'À débordement.mp3',            gain: 0.08, fadeIn: 3, fadeOut: 2, pan:  0.00 },
  burnOut:        { file: 'burn-out.mp3',                 gain: 0.08, fadeIn: 4, fadeOut: 3, pan:  0.00 },
  spt:            { file: 'stress-post-traumatique.mp3',  gain: 0.06, fadeIn: 6, fadeOut: 4, pan:  0.00 },
}

const bufferCache = new Map()
let ambientState = null

export function isAmbientEnabled() {
  try { return localStorage.getItem(AMBIENT_CONSENT_KEY) === 'yes' } catch { return false }
}
export function setAmbientEnabled(value) {
  try { localStorage.setItem(AMBIENT_CONSENT_KEY, value ? 'yes' : 'no') } catch {}
  if (!value) stopAmbient(true)
}

async function loadBuffer(key) {
  if (bufferCache.has(key)) return bufferCache.get(key)
  const def = AMBIENT_TRACKS[key]
  if (!def) return null
  try {
    const res = await fetch(AMBIENT_BASE + encodeURIComponent(def.file))
    if (!res.ok) return null
    const arr = await res.arrayBuffer()
    ensureContext()
    if (!ctx) return null
    const buf = await ctx.decodeAudioData(arr)
    bufferCache.set(key, buf)
    return buf
  } catch { return null }
}

export async function setAmbientTrack(key) {
  if (!isAmbientEnabled() || !key) return
  if (ambientState?.key === key) return
  ensureContext()
  resume()
  if (!ctx) return
  if (ambientState) return crossfadeAmbient(key)
  const def = AMBIENT_TRACKS[key]
  const buf = await loadBuffer(key)
  if (!buf || !isAmbientEnabled()) return  // re-check after async
  const t = ctx.currentTime
  const src = ctx.createBufferSource()
  src.buffer = buf
  src.loop = true
  const g = ctx.createGain()
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(def.gain, t + def.fadeIn)
  const p = ctx.createStereoPanner()
  p.pan.value = def.pan
  src.connect(p).connect(g).connect(masterGain)
  src.start(t)
  ambientState = { key, src, gain: g, panner: p, def }
}

export function stopAmbient(immediate = false) {
  if (!ambientState || !ctx) return
  const t = ctx.currentTime
  const fade = immediate ? 0.2 : ambientState.def.fadeOut
  const s = ambientState
  ambientState = null
  try {
    s.gain.gain.cancelScheduledValues(t)
    s.gain.gain.setValueAtTime(s.gain.gain.value, t)
    s.gain.gain.linearRampToValueAtTime(0, t + fade)
  } catch {}
  setTimeout(() => { try { s.src.stop() } catch {} }, fade * 1000 + 120)
}

export async function crossfadeAmbient(toKey, duration = 5) {
  if (!isAmbientEnabled() || !ctx) return
  if (!ambientState) return setAmbientTrack(toKey)
  if (ambientState.key === toKey) return
  const def = AMBIENT_TRACKS[toKey]
  const buf = await loadBuffer(toKey)
  if (!buf || !isAmbientEnabled()) return
  const t = ctx.currentTime
  const src = ctx.createBufferSource()
  src.buffer = buf
  src.loop = true
  const g = ctx.createGain()
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(def.gain, t + duration)
  const p = ctx.createStereoPanner()
  p.pan.value = def.pan
  src.connect(p).connect(g).connect(masterGain)
  src.start(t)
  const old = ambientState
  try {
    old.gain.gain.cancelScheduledValues(t)
    old.gain.gain.setValueAtTime(old.gain.gain.value, t)
    old.gain.gain.linearRampToValueAtTime(0, t + duration)
  } catch {}
  setTimeout(() => { try { old.src.stop() } catch {} }, duration * 1000 + 120)
  ambientState = { key: toKey, src, gain: g, panner: p, def }
}

export function pickAmbientForContext({ screen, archetype, hour }) {
  const h = hour ?? new Date().getHours()
  if (screen === 'cocon')         return (h >= 22 || h < 6) ? 'silencieuse' : 'surMaPlanete'
  if (screen === 'espaceVrai')    return 'monCoeur'
  if (screen === 'breathing')     return archetype === 'resilience' ? 'souffleCourt' : 'entreTension'
  if (screen === 'liberation')    return 'debordement'
  if (screen === 'returning-long') return 'ceQuiReste'
  if (screen === 'home')          return (h >= 22 || h < 6) ? 'silencieuse' : 'caVa'
  return null
}

export function getAmbientTracks() {
  return Object.keys(AMBIENT_TRACKS)
}

// Initialize global press tap (subtle) — call from App boot
export function initAudioPressFeedback() {
  if (typeof document === 'undefined') return () => {}
  const handler = (e) => {
    const el = e.target.closest && e.target.closest('[data-press]')
    if (!el) return
    playTap()
  }
  document.addEventListener('pointerdown', handler, { passive: true })
  return () => document.removeEventListener('pointerdown', handler)
}

export default { setAudioEnabled, getAudioEnabled, playTap, playConfirm, playSouvenir, playChime, playRelease, playBreathIn, playBreathOut, playOpen, playClose, playMilestone, initAudioPressFeedback, startCoconAmbience, stopCoconAmbience, isCoconAmbiencePlaying, setAmbientTrack, stopAmbient, crossfadeAmbient, pickAmbientForContext, isAmbientEnabled, setAmbientEnabled, getAmbientTracks }
