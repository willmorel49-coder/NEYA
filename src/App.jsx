import { useState, useEffect, useRef, useCallback } from 'react'

// ─── DONNÉES STATIQUES ────────────────────────────────────────────────────────

const RITUAL_COLORS = [
  { hex: '#1e1b4b', label: 'nuit' },
  { hex: '#5b21b6', label: 'violet' },
  { hex: '#7f1d1d', label: 'brique' },
  { hex: '#92400e', label: 'ambre' },
  { hex: '#14532d', label: 'mousse' },
  { hex: '#374151', label: 'perle' },
  { hex: '#0c0c0c', label: 'noir' },
  { hex: '#ece8df', label: 'crème' },
]

const RITUAL_TEXTURES = ['lourd', 'léger', 'rugueux', 'doux', 'chaud', 'froid']

const RITUAL_SOUNDS = ['pluie', 'vent', 'feu', 'silence']

const WORLDS = {
  brume: {
    palette: ['#0d1b2a', '#1b2d4f', '#2e4a7a'],
    animal: 'cerf',
    animationSpeed: 'slow',
    phrases: [
      "Quelque chose en toi cherche le calme.",
      "On dirait que tout pèse un peu plus aujourd'hui.",
      "Quelque chose ralentit en toi aujourd'hui.",
      "Tu peux rester ici sans résoudre quoi que ce soit.",
      "Il n'y a rien à résoudre pour l'instant.",
      "Tu peux rester ici un moment.",
    ],
  },
}

function selectPhrase(ritual, world) {
  const colorIdx = RITUAL_COLORS.findIndex(c => c.hex === ritual.color)
  const textureIdx = RITUAL_TEXTURES.indexOf(ritual.texture)
  const idx = (colorIdx + textureIdx) % world.phrases.length
  return world.phrases[idx]
}

// ─── APP ──────────────────────────────────────────────────────────────────────

const INITIAL_RITUAL = { color: null, texture: null, sound: null, completedAt: null }

export default function App() {
  const [screen, setScreen] = useState('onboarding')
  const [step, setStep] = useState(0)
  const [ritual, setRitual] = useState(INITIAL_RITUAL)
  const [muted, setMuted] = useState(false)

  const goTo = useCallback((nextScreen, nextStep = 0) => {
    setScreen(nextScreen)
    setStep(nextStep)
  }, [])

  const world = WORLDS.brume

  return (
    <div className="w-full h-full bg-[#050810] relative overflow-hidden font-inter text-white">
      {screen === 'onboarding' && (
        <div className="p-8 font-sora text-white/40">onboarding step {step}</div>
      )}
      {screen === 'ritual' && (
        <div className="p-8 font-sora text-white/40">ritual step {step}</div>
      )}
      {screen === 'world' && (
        <div className="p-8 font-sora text-white/40">world</div>
      )}
      {screen === 'vrai' && (
        <div className="p-8 font-sora text-white/40">espace vrai</div>
      )}
    </div>
  )
}
