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

// ─── LOGO NÉYA ────────────────────────────────────────────────────────────────

function NeyaLogo({ size = 'sm', className = '' }) {
  const scales = { sm: { star: 14, text: 11 }, md: { star: 18, text: 13 }, lg: { star: 24, text: 16 } }
  const s = scales[size]
  return (
    <div className={`flex flex-col items-center gap-1.5 select-none ${className}`}>
      <svg width={s.star} height={s.star} viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2 L12.8 9.5 L19.5 6.5 L14.5 12 L21 14.5 L13.5 13.5 L15 21 L12 14.5 L9 21 L10.5 13.5 L3 14.5 L9.5 12 L4.5 6.5 L11.2 9.5 Z"
          fill="rgba(255,255,255,0.65)"
          style={{ filter: 'blur(0.4px)' }}
        />
      </svg>
      <span
        className="font-sora tracking-[0.35em] uppercase"
        style={{ fontSize: s.text, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.35em' }}
      >
        NÉYA
      </span>
    </div>
  )
}

// ─── GRAIN FILTER ─────────────────────────────────────────────────────────────

function GrainFilter() {
  return (
    <svg style={{ display: 'none', position: 'absolute' }}>
      <defs>
        <filter id="grain" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.68"
            numOctaves="4"
            stitchTiles="stitch"
            result="noise"
          />
          <feColorMatrix type="saturate" values="0" in="noise" result="grayNoise" />
          <feBlend in="SourceGraphic" in2="grayNoise" mode="overlay" result="blend" />
          <feComposite in="blend" in2="SourceGraphic" operator="in" />
        </filter>
      </defs>
    </svg>
  )
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
      style={{ opacity: visible ? 1 : 0, transition: `opacity ${duration}ms ease`, ...style }}
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
    <Fade className="w-full h-full relative overflow-hidden">
      {/* Image de fond — fille de dos dans grotte avec mandalas bleus */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(/bg-onboarding.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
        }}
      />
      {/* Voile sombre pour lisibilité */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #050810 8%, rgba(5,8,16,0.55) 50%, rgba(5,8,16,0.2) 100%)' }} />
      {/* Question */}
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-24 px-8">
        <p
          className="font-sora font-light text-white/70 text-xl text-center"
          style={{ letterSpacing: '0.12em', lineHeight: 1.7 }}
        >
          Et toi, ça va vraiment&nbsp;?
        </p>
      </div>
    </Fade>
  )
}

function OnboardingScreen1() {
  const [visibleLines, setVisibleLines] = useState(0)
  useEffect(() => {
    const timers = [
      setTimeout(() => setVisibleLines(1), 400),
      setTimeout(() => setVisibleLines(2), 1400),
      setTimeout(() => setVisibleLines(3), 2400),
      setTimeout(() => setVisibleLines(4), 3600),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  const lines = [
    { text: "Pas une appli de méditation.", size: 'text-base', opacity: 0.4 },
    { text: "Pas un journal.", size: 'text-base', opacity: 0.4 },
    { text: "Pas un thérapeute.", size: 'text-base', opacity: 0.4 },
    { text: "Un espace pour ce que tu ressens vraiment.", size: 'text-lg', opacity: 0.75 },
  ]

  return (
    <Fade className="w-full h-full flex flex-col items-center justify-center px-10 gap-6">
      <div className="flex flex-col items-center gap-5">
        {lines.map((line, i) => (
          <p
            key={i}
            className={`font-sora font-light ${line.size} text-center transition-opacity duration-700`}
            style={{
              opacity: visibleLines > i ? line.opacity : 0,
              color: 'white',
              letterSpacing: '0.05em',
            }}
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
      className="w-full h-full flex flex-col items-center justify-center px-10 gap-14"
      style={{ background: 'linear-gradient(to bottom, #050810, #060b0e)' }}
    >
      <p
        className="font-sora font-light text-white/65 text-xl text-center"
        style={{ lineHeight: 1.9, letterSpacing: '0.05em' }}
      >
        T'as pas besoin<br />d'aller bien<br />pour commencer.
      </p>
      <button
        onClick={e => { e.stopPropagation(); onEnter() }}
        className="font-sora text-white/35 text-xs hover:text-white/65 transition-colors duration-700"
        style={{ letterSpacing: '0.35em', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 4 }}
      >
        ENTRER
      </button>
    </Fade>
  )
}

// ─── AUDIO ───────────────────────────────────────────────────────────────────

function startAmbience(type, volume = 0.07) {
  if (type === 'silence') return () => {}
  const ctx = new (window.AudioContext || window.webkitAudioContext)()
  const gainNode = ctx.createGain()
  gainNode.gain.setValueAtTime(0, ctx.currentTime)
  gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 2)
  gainNode.connect(ctx.destination)

  const bufferSize = ctx.sampleRate * 4
  const buf = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1
  const source = ctx.createBufferSource()
  source.buffer = buf
  source.loop = true

  const filter = ctx.createBiquadFilter()
  if (type === 'pluie') { filter.type = 'highpass'; filter.frequency.value = 2200 }
  else if (type === 'vent') { filter.type = 'bandpass'; filter.frequency.value = 380; filter.Q.value = 0.4 }
  else if (type === 'feu') { filter.type = 'lowpass'; filter.frequency.value = 280 }

  source.connect(filter)
  filter.connect(gainNode)
  source.start()
  return () => {
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 1)
    setTimeout(() => { try { ctx.close() } catch (e) {} }, 1200)
  }
}

// ─── RITUAL ───────────────────────────────────────────────────────────────────

function RitualFlow({ step, ritual, onChange, onComplete, muted }) {
  return (
    <div className="w-full h-full absolute inset-0 flex flex-col items-center justify-center">
      <div
        className="absolute inset-0 transition-all duration-[1200ms] ease-out"
        style={{
          background: ritual.color
            ? `radial-gradient(ellipse at center 40%, ${ritual.color}20 0%, #050810 65%)`
            : '#050810',
        }}
      />
      {/* Grain léger sur le fond ritual */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")', backgroundRepeat: 'repeat', backgroundSize: '128px' }}
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
    { top: '15%', left: '20%' },
    { top: '11%', left: '58%' },
    { top: '26%', left: '80%' },
    { top: '44%', left: '84%' },
    { top: '63%', left: '72%' },
    { top: '70%', left: '35%' },
    { top: '57%', left: '12%' },
    { top: '33%', left: '8%' },
  ]
  const sizes = [42, 36, 48, 38, 44, 40, 34, 46]

  return (
    <div className="w-full h-full relative flex items-center justify-center">
      <p className="absolute top-12 left-1/2 -translate-x-1/2 font-sora text-white/18 text-xs" style={{ letterSpacing: '0.28em' }}>
        UNE COULEUR
      </p>
      {RITUAL_COLORS.map((c, i) => (
        <button
          key={c.hex}
          onClick={() => onSelect(c.hex)}
          aria-label={c.label}
          className="absolute rounded-full transition-all duration-600"
          style={{
            ...positions[i],
            width: selected === c.hex ? sizes[i] + 14 : sizes[i],
            height: selected === c.hex ? sizes[i] + 14 : sizes[i],
            background: c.hex,
            opacity: selected && selected !== c.hex ? 0.22 : 0.8,
            boxShadow: selected === c.hex ? `0 0 28px ${c.hex}70, 0 0 8px ${c.hex}40` : 'none',
            transform: selected === c.hex ? 'scale(1.12)' : 'scale(1)',
            filter: 'saturate(0.65) brightness(0.9)',
            transition: 'all 0.5s ease',
          }}
        />
      ))}
      {selected && (
        <Fade className="absolute bottom-14 left-1/2 -translate-x-1/2">
          <button
            onClick={onNext}
            className="font-sora text-white/30 text-xs hover:text-white/60 transition-colors duration-500"
            style={{ letterSpacing: '0.3em' }}
          >
            CONTINUER
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

  // Positions spatiales — pas une grille parfaite
  const positions = [
    { top: '18%', left: '50%', translateX: '-50%' },
    { top: '30%', left: '72%', translateX: '0' },
    { top: '44%', left: '25%', translateX: '0' },
    { top: '54%', left: '65%', translateX: '0' },
    { top: '67%', left: '38%', translateX: '0' },
    { top: '78%', left: '58%', translateX: '0' },
  ]

  return (
    <div className="w-full h-full relative flex items-center justify-center">
      <p className="absolute top-12 left-1/2 -translate-x-1/2 font-sora text-white/18 text-xs" style={{ letterSpacing: '0.28em' }}>
        UNE SENSATION
      </p>
      {isolated ? (
        <Fade key={isolated} className="flex items-center justify-center w-full">
          <p className="font-sora font-light text-white/80 text-4xl" style={{ letterSpacing: '0.2em' }}>
            {isolated}
          </p>
        </Fade>
      ) : (
        <>
          {RITUAL_TEXTURES.map((word, i) => (
            <button
              key={word}
              onClick={() => handleSelect(word)}
              className="absolute font-sora font-light text-2xl transition-all duration-500"
              style={{
                top: positions[i].top,
                left: positions[i].left,
                transform: `translateX(${positions[i].translateX})`,
                color: selected === word ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.22)',
                letterSpacing: '0.18em',
              }}
            >
              {word}
            </button>
          ))}
        </>
      )}
      {selected && !isolated && (
        <Fade className="absolute bottom-14 left-1/2 -translate-x-1/2">
          <button
            onClick={onNext}
            className="font-sora text-white/30 text-xs hover:text-white/60 transition-colors duration-500"
            style={{ letterSpacing: '0.3em' }}
          >
            CONTINUER
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
      stopRef.current = startAmbience(sound, 0.055)
    } else {
      stopRef.current = () => {}
    }
  }

  useEffect(() => () => stopRef.current(), [])

  const soundItems = [
    { key: 'pluie',   symbol: '〰', label: 'pluie' },
    { key: 'vent',    symbol: '∿', label: 'vent' },
    { key: 'feu',     symbol: '◦', label: 'feu' },
    { key: 'silence', symbol: '—', label: 'silence' },
  ]

  return (
    <div className="w-full h-full relative flex items-center justify-center">
      <p className="absolute top-12 left-1/2 -translate-x-1/2 font-sora text-white/18 text-xs" style={{ letterSpacing: '0.28em' }}>
        UN SON
      </p>
      <div className="flex flex-col gap-10 items-center">
        {soundItems.map(({ key, symbol, label }) => (
          <button
            key={key}
            onClick={() => handleSelect(key)}
            className="font-sora font-light text-xl flex items-baseline gap-4 transition-all duration-500"
            style={{
              color: selected === key ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.2)',
              letterSpacing: '0.18em',
              transform: selected === key ? 'scale(1.06)' : 'scale(1)',
            }}
          >
            <span className="opacity-50 text-sm">{symbol}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>
      {selected && (
        <Fade className="absolute bottom-14 left-1/2 -translate-x-1/2">
          <button
            onClick={onNext}
            className="font-sora text-white/30 text-xs hover:text-white/60 transition-colors duration-500"
            style={{ letterSpacing: '0.3em' }}
          >
            ENTRER DANS LE MONDE
          </button>
        </Fade>
      )}
    </div>
  )
}

// ─── WORLD REVEAL ─────────────────────────────────────────────────────────────

function WorldReveal({ ritual, world, onGoVrai, muted }) {
  const [phase, setPhase] = useState('black')
  const [displayedPhrase, setDisplayedPhrase] = useState('')
  const fullPhrase = selectPhrase(ritual, world)
  const stopSoundRef = useRef(() => {})

  useEffect(() => {
    const t1 = setTimeout(() => {
      setPhase('world')
      if (!muted && ritual.sound && ritual.sound !== 'silence') {
        stopSoundRef.current = startAmbience(ritual.sound, 0.04)
      }
    }, 900)
    const t2 = setTimeout(() => setPhase('phrase'), 3000)
    return () => { clearTimeout(t1); clearTimeout(t2); stopSoundRef.current() }
  }, []) // eslint-disable-line

  useEffect(() => {
    if (phase !== 'phrase') return
    let i = 0
    const interval = setInterval(() => {
      setDisplayedPhrase(fullPhrase.slice(0, i + 1))
      i++
      if (i >= fullPhrase.length) clearInterval(interval)
    }, 42)
    return () => clearInterval(interval)
  }, [phase, fullPhrase])

  const textureModifier = {
    lourd:   { speed: '18s', brightness: 0.82 },
    léger:   { speed: '28s', brightness: 1.05 },
    rugueux: { speed: '12s', brightness: 0.78 },
    doux:    { speed: '22s', brightness: 0.95 },
    chaud:   { speed: '20s', brightness: 0.92 },
    froid:   { speed: '25s', brightness: 0.88 },
  }
  const mod = textureModifier[ritual.texture] || textureModifier.doux

  return (
    <div
      className="w-full h-full absolute inset-0 transition-opacity duration-[900ms]"
      style={{ opacity: phase === 'black' ? 0 : 1 }}
    >
      {/* Image de fond Brume */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(/bg-brume.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          animation: `breathe ${mod.speed} ease-in-out infinite`,
        }}
      />
      {/* Voile coloré selon ritual.color */}
      <div
        className="absolute inset-0 transition-all duration-[2000ms]"
        style={{
          background: ritual.color
            ? `radial-gradient(ellipse at 50% 80%, ${ritual.color}28 0%, transparent 60%)`
            : 'transparent',
        }}
      />
      {/* Voile sombre Brume par-dessus */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to top, ${world.palette[0]}ee 0%, ${world.palette[0]}99 35%, ${world.palette[1]}66 70%, transparent 100%)`,
          filter: `brightness(${mod.brightness})`,
        }}
      />

      <style>{`
        @keyframes breathe {
          0%, 100% { transform: scale(1); filter: brightness(1); }
          50% { transform: scale(1.03); filter: brightness(1.07); }
        }
        @keyframes cerfdrift {
          0%, 100% { transform: translate(0px, 0px); }
          30% { transform: translate(6px, -4px); }
          70% { transform: translate(-4px, 5px); }
        }
        @keyframes phraseReveal {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Logo NÉYA */}
      {phase !== 'black' && (
        <Fade className="absolute top-10 left-1/2 -translate-x-1/2" duration={1200}>
          <NeyaLogo size="sm" />
        </Fade>
      )}

      {/* Cerf — déjà là, l'animal qui existait avant */}
      <div
        className="absolute inset-0 flex items-end justify-center pointer-events-none pb-6"
        style={{ animation: 'cerfdrift 22s ease-in-out infinite' }}
      >
        <img
          src="/cerf.svg"
          alt=""
          aria-hidden="true"
          className="w-64 max-w-[55vw]"
          style={{ opacity: 0.55, filter: 'blur(0.3px) brightness(1.3)' }}
        />
      </div>

      {/* Phrase */}
      {phase === 'phrase' && (
        <div
          className="absolute inset-0 flex items-center justify-center px-10 pb-28"
          style={{ animation: 'phraseReveal 0.8s ease forwards' }}
        >
          <p
            className="font-sora font-light text-white/60 text-lg text-center"
            style={{ lineHeight: 1.85, letterSpacing: '0.06em' }}
          >
            {displayedPhrase}
          </p>
        </div>
      )}

      {/* Lien Espace Vrai */}
      {phase === 'phrase' && displayedPhrase.length === fullPhrase.length && (
        <Fade className="absolute bottom-10 left-1/2 -translate-x-1/2" duration={1200}>
          <button
            onClick={onGoVrai}
            className="font-sora text-white/18 text-xs hover:text-white/45 transition-colors duration-700"
            style={{ letterSpacing: '0.3em' }}
          >
            espace vrai →
          </button>
        </Fade>
      )}
    </div>
  )
}

// ─── ESPACE VRAI ──────────────────────────────────────────────────────────────

function generateFakeFlux(userColor) {
  const colors = RITUAL_COLORS.map(c => c.hex)
  const entries = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    color: colors[i % colors.length],
    x: 8 + Math.random() * 84,
    y: 8 + Math.random() * 84,
    size: 5 + Math.random() * 9,
    opacity: 0.15 + Math.random() * 0.4,
    driftX: (Math.random() - 0.5) * 28,
    driftY: (Math.random() - 0.5) * 18,
    period: 14 + Math.random() * 22,
    delay: Math.random() * 12,
    immobile: Math.random() < 0.28,
  }))

  entries.push({
    id: 99,
    color: userColor || '#4f46e5',
    x: 35 + Math.random() * 30,
    y: 35 + Math.random() * 30,
    size: 10,
    opacity: 0.6,
    driftX: (Math.random() - 0.5) * 18,
    driftY: (Math.random() - 0.5) * 12,
    period: 18 + Math.random() * 6,
    delay: 1.8,
    immobile: false,
  })

  return entries
}

function EspaceVrai({ ritual, world }) {
  const flux = useRef(generateFakeFlux(ritual.color)).current

  return (
    <Fade className="w-full h-full absolute inset-0" duration={1400}>
      {/* Image de fond Espace Vrai */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(/bg-vrai.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      {/* Voile monde Brume par-dessus */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to top, ${world.palette[0]}f5 0%, ${world.palette[0]}cc 40%, ${world.palette[1]}99 80%, ${world.palette[0]}bb 100%)`,
        }}
      />

      {/* Présences — flux SVG */}
      <svg className="absolute inset-0 w-full h-full" style={{ overflow: 'visible' }}>
        <defs>
          <filter id="presence-soft">
            <feGaussianBlur stdDeviation="2" />
          </filter>
          <filter id="presence-user">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>
        {flux.map(p => (
          <circle
            key={p.id}
            cx={`${p.x}%`}
            cy={`${p.y}%`}
            r={p.size}
            fill={p.color}
            opacity={p.opacity}
            filter={p.id === 99 ? 'url(#presence-user)' : 'url(#presence-soft)'}
            style={{
              animation: p.immobile
                ? 'none'
                : `drift-${p.id} ${p.period}s ${p.delay}s ease-in-out infinite`,
            }}
          />
        ))}
        <style>
          {flux
            .filter(p => !p.immobile)
            .map(p => `
              @keyframes drift-${p.id} {
                0%, 100% { transform: translate(0, 0); }
                25% { transform: translate(${p.driftX * 0.4}px, ${p.driftY * 0.3}px); }
                50% { transform: translate(${p.driftX}px, ${p.driftY}px); }
                75% { transform: translate(${p.driftX * 0.6}px, ${p.driftY * 0.8}px); }
              }
            `)
            .join('')}
        </style>
      </svg>

      {/* Message implicite */}
      <Fade className="absolute bottom-12 left-1/2 -translate-x-1/2 text-center" duration={2500}>
        <p className="font-sora text-white/15 text-xs" style={{ letterSpacing: '0.22em' }}>
          tu n'es pas seul·e
        </p>
      </Fade>

      {/* Logo discret en bas */}
      <Fade className="absolute bottom-5 left-1/2 -translate-x-1/2" duration={2000}>
        <NeyaLogo size="sm" className="opacity-25" />
      </Fade>
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

  const handleRitualChange = useCallback((updated) => setRitual(updated), [])

  const handleRitualStepComplete = useCallback((completedStep) => {
    if (completedStep < 2) {
      setStep(s => s + 1)
    } else {
      setRitual(r => ({ ...r, completedAt: new Date() }))
      goTo('world')
    }
  }, [goTo])

  const handleOnboardingNext = useCallback(() => {
    if (step < 2) setStep(s => s + 1)
    else goTo('ritual')
  }, [step, goTo])

  const handleGoVrai = useCallback(() => goTo('vrai'), [goTo])

  return (
    <div className="w-full h-full bg-[#050810] relative overflow-hidden font-inter text-white">
      <GrainFilter />

      {/* Bouton mute */}
      <button
        onClick={() => setMuted(m => !m)}
        aria-label={muted ? 'Activer le son' : 'Couper le son'}
        className="absolute top-5 right-5 z-50 font-sora text-white/18 text-xs hover:text-white/45 transition-colors duration-500 select-none"
        style={{ letterSpacing: '0.1em' }}
      >
        {muted ? '○' : '●'}
      </button>

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
        <WorldReveal
          ritual={ritual}
          world={world}
          muted={muted}
          onGoVrai={handleGoVrai}
        />
      )}
      {screen === 'vrai' && (
        <EspaceVrai ritual={ritual} world={world} />
      )}
    </div>
  )
}
