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

// ─── AUDIO ───────────────────────────────────────────────────────────────────

function startAmbience(type, volume = 0.08) {
  if (type === 'silence') return () => {}

  const ctx = new (window.AudioContext || window.webkitAudioContext)()
  const gainNode = ctx.createGain()
  gainNode.gain.setValueAtTime(0, ctx.currentTime)
  gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 1.5)
  gainNode.connect(ctx.destination)

  const bufferSize = ctx.sampleRate * 4
  const buf = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1

  const source = ctx.createBufferSource()
  source.buffer = buf
  source.loop = true

  const filter = ctx.createBiquadFilter()

  if (type === 'pluie') {
    filter.type = 'highpass'
    filter.frequency.value = 2000
  } else if (type === 'vent') {
    filter.type = 'bandpass'
    filter.frequency.value = 400
    filter.Q.value = 0.5
  } else if (type === 'feu') {
    filter.type = 'lowpass'
    filter.frequency.value = 300
  }

  source.connect(filter)
  filter.connect(gainNode)
  source.start()

  return () => {
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8)
    setTimeout(() => { try { ctx.close() } catch(e) {} }, 1000)
  }
}

// ─── RITUAL ───────────────────────────────────────────────────────────────────

function RitualFlow({ step, ritual, onChange, onComplete, muted }) {
  return (
    <div className="w-full h-full absolute inset-0 flex flex-col items-center justify-center">
      {/* Fond réactif — teinte subtile selon la couleur choisie */}
      <div
        className="absolute inset-0 transition-all duration-1000 ease-out"
        style={{
          background: ritual.color
            ? `radial-gradient(ellipse at center, ${ritual.color}18 0%, #050810 70%)`
            : '#050810',
        }}
      />
      <Fade key={step} className="w-full h-full flex items-center justify-center relative z-10">
        {step === 0 && (
          <RitualColor
            selected={ritual.color}
            onSelect={color => onChange({ ...ritual, color })}
            onNext={() => onComplete(0)}
          />
        )}
        {step === 1 && (
          <RitualTexture
            selected={ritual.texture}
            onSelect={texture => onChange({ ...ritual, texture })}
            onNext={() => onComplete(1)}
          />
        )}
        {step === 2 && (
          <RitualSound
            selected={ritual.sound}
            onSelect={sound => onChange({ ...ritual, sound })}
            onNext={() => onComplete(2)}
            muted={muted}
          />
        )}
      </Fade>
    </div>
  )
}

function RitualColor({ selected, onSelect, onNext }) {
  const positions = [
    { top: '18%', left: '22%' },
    { top: '14%', left: '55%' },
    { top: '28%', left: '78%' },
    { top: '45%', left: '82%' },
    { top: '62%', left: '70%' },
    { top: '68%', left: '38%' },
    { top: '55%', left: '15%' },
    { top: '35%', left: '10%' },
  ]

  return (
    <div className="w-full h-full relative flex items-center justify-center">
      <p className="absolute top-12 left-1/2 -translate-x-1/2 font-sora text-white/20 text-xs tracking-[0.25em] uppercase">
        une couleur
      </p>
      {RITUAL_COLORS.map((c, i) => (
        <button
          key={c.hex}
          onClick={() => onSelect(c.hex)}
          aria-label={c.label}
          className="absolute rounded-full transition-all duration-500"
          style={{
            ...positions[i],
            width: selected === c.hex ? 52 : 38,
            height: selected === c.hex ? 52 : 38,
            background: c.hex,
            opacity: selected && selected !== c.hex ? 0.3 : 0.85,
            boxShadow: selected === c.hex ? `0 0 24px ${c.hex}60` : 'none',
            transform: selected === c.hex ? 'scale(1.15)' : 'scale(1)',
            filter: 'saturate(0.7) brightness(0.85)',
          }}
        />
      ))}
      {selected && (
        <Fade className="absolute bottom-14 left-1/2 -translate-x-1/2">
          <button
            onClick={onNext}
            className="font-sora text-white/35 text-xs tracking-[0.3em] uppercase hover:text-white/60 transition-colors duration-500"
          >
            continuer
          </button>
        </Fade>
      )}
    </div>
  )
}

function RitualTexture({ selected, onSelect, onNext }) {
  const [isolated, setIsolated] = useState(null)

  const handleSelect = (word) => {
    onSelect(word)
    setIsolated(word)
    setTimeout(() => setIsolated(null), 800)
  }

  return (
    <div className="w-full h-full relative flex items-center justify-center">
      <p className="absolute top-12 left-1/2 -translate-x-1/2 font-sora text-white/20 text-xs tracking-[0.25em] uppercase">
        une sensation
      </p>
      {isolated ? (
        <Fade key={isolated} className="flex items-center justify-center w-full">
          <p className="font-sora font-light text-white/80 text-4xl tracking-widest">
            {isolated}
          </p>
        </Fade>
      ) : (
        <div className="flex flex-col gap-8 items-center">
          {RITUAL_TEXTURES.map((word) => (
            <button
              key={word}
              onClick={() => handleSelect(word)}
              className="font-sora font-light text-2xl tracking-[0.2em] transition-all duration-500"
              style={{
                color: selected === word ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.25)',
                transform: selected === word ? 'scale(1.08)' : 'scale(1)',
              }}
            >
              {word}
            </button>
          ))}
        </div>
      )}
      {selected && !isolated && (
        <Fade className="absolute bottom-14 left-1/2 -translate-x-1/2">
          <button
            onClick={onNext}
            className="font-sora text-white/35 text-xs tracking-[0.3em] uppercase hover:text-white/60 transition-colors duration-500"
          >
            continuer
          </button>
        </Fade>
      )}
    </div>
  )
}

function RitualSound({ selected, onSelect, onNext, muted }) {
  const stopRef = useRef(() => {})

  const handleSelect = (sound) => {
    stopRef.current()
    onSelect(sound)
    if (!muted && sound !== 'silence') {
      stopRef.current = startAmbience(sound, 0.06)
    } else {
      stopRef.current = () => {}
    }
  }

  useEffect(() => () => stopRef.current(), [])

  const soundLabels = {
    pluie: '〰 pluie',
    vent: '∿ vent',
    feu: '◦ feu',
    silence: '— silence',
  }

  return (
    <div className="w-full h-full relative flex items-center justify-center">
      <p className="absolute top-12 left-1/2 -translate-x-1/2 font-sora text-white/20 text-xs tracking-[0.25em] uppercase">
        un son
      </p>
      <div className="flex flex-col gap-10 items-center">
        {RITUAL_SOUNDS.map((sound) => (
          <button
            key={sound}
            onClick={() => handleSelect(sound)}
            className="font-sora font-light text-xl tracking-[0.2em] transition-all duration-500"
            style={{
              color: selected === sound ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.22)',
              transform: selected === sound ? 'scale(1.08)' : 'scale(1)',
            }}
          >
            {soundLabels[sound]}
          </button>
        ))}
      </div>
      {selected && (
        <Fade className="absolute bottom-14 left-1/2 -translate-x-1/2">
          <button
            onClick={onNext}
            className="font-sora text-white/35 text-xs tracking-[0.3em] uppercase hover:text-white/60 transition-colors duration-500"
          >
            entrer dans le monde
          </button>
        </Fade>
      )}
    </div>
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

  const handleRitualChange = useCallback((updated) => {
    setRitual(updated)
  }, [])

  const handleRitualStepComplete = useCallback((completedStep) => {
    if (completedStep < 2) {
      setStep(s => s + 1)
    } else {
      setRitual(r => ({ ...r, completedAt: new Date() }))
      goTo('world')
    }
  }, [goTo])

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
        <RitualFlow
          step={step}
          ritual={ritual}
          onChange={handleRitualChange}
          onComplete={handleRitualStepComplete}
          muted={muted}
        />
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
