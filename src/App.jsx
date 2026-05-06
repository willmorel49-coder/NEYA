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

// ─── COMPOSANT FADE ───────────────────────────────────────────────────────────

function Fade({ children, duration = 800, className = '', style = {} }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(t)
  }, [])

  return (
    <div
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transition: `opacity ${duration}ms ease`,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

// ─── ONBOARDING ───────────────────────────────────────────────────────────────

function Onboarding({ step, onNext }) {
  return (
    <div
      className="w-full h-full absolute inset-0 flex flex-col items-center justify-center cursor-pointer"
      onClick={onNext}
    >
      {step === 0 && <OnboardingScreen0 />}
      {step === 1 && <OnboardingScreen1 />}
      {step === 2 && <OnboardingScreen2 onEnter={onNext} />}
    </div>
  )
}

function OnboardingScreen0() {
  return (
    <Fade className="w-full h-full flex flex-col items-center justify-center relative">
      <img
        src="/cerf.svg"
        alt=""
        aria-hidden="true"
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 opacity-30 pointer-events-none"
        style={{ filter: 'blur(0.5px)' }}
      />
      <p
        className="font-sora font-light text-white/70 text-xl text-center px-8 relative z-10"
        style={{ letterSpacing: '0.15em' }}
      >
        Et toi, ça va vraiment&nbsp;?
      </p>
    </Fade>
  )
}

function OnboardingScreen1() {
  const [visibleLines, setVisibleLines] = useState(0)

  useEffect(() => {
    const timers = [
      setTimeout(() => setVisibleLines(1), 400),
      setTimeout(() => setVisibleLines(2), 1200),
      setTimeout(() => setVisibleLines(3), 2000),
      setTimeout(() => setVisibleLines(4), 3200),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  const lines = [
    { text: "Pas une appli de méditation.", font: 'font-inter', size: 'text-base', color: 'text-white/45' },
    { text: "Pas un journal.", font: 'font-inter', size: 'text-base', color: 'text-white/45' },
    { text: "Pas un thérapeute.", font: 'font-inter', size: 'text-base', color: 'text-white/45' },
    { text: "Un espace pour ce que tu ressens vraiment.", font: 'font-sora', size: 'text-lg', color: 'text-white/80' },
  ]

  return (
    <Fade className="w-full h-full flex flex-col items-center justify-center px-10 gap-6">
      <div className="flex flex-col items-center gap-4">
        {lines.map((line, i) => (
          <p
            key={i}
            className={`${line.font} font-light ${line.size} ${line.color} text-center transition-opacity duration-700`}
            style={{ opacity: visibleLines > i ? 1 : 0 }}
          >
            {line.text}
          </p>
        ))}
      </div>
    </Fade>
  )
}

function OnboardingScreen2({ onEnter }) {
  return (
    <Fade
      className="w-full h-full flex flex-col items-center justify-center px-10 gap-12"
      style={{ background: 'linear-gradient(to bottom, #050810, #0d0e0a)' }}
    >
      <p className="font-sora font-light text-white/70 text-xl text-center leading-relaxed">
        T'as pas besoin<br />d'aller bien<br />pour commencer.
      </p>
      <button
        onClick={e => { e.stopPropagation(); onEnter() }}
        className="font-sora text-white/40 text-sm tracking-[0.3em] uppercase hover:text-white/70 transition-colors duration-500 border-b border-white/15 pb-1"
      >
        Entrer
      </button>
    </Fade>
  )
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

  const handleOnboardingNext = useCallback(() => {
    if (step < 2) {
      setStep(s => s + 1)
    } else {
      goTo('ritual')
    }
  }, [step, goTo])

  return (
    <div className="w-full h-full bg-[#050810] relative overflow-hidden font-inter text-white">
      {screen === 'onboarding' && (
        <Onboarding step={step} onNext={handleOnboardingNext} />
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
