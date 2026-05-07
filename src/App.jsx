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
    phrases: {
      // Indexées par (colorLabel, textureLabel) → phrase
      // Fallback par texture seule si pas de correspondance exacte
      byTexture: {
        lourd:   [
          "On dirait que tout pèse un peu plus aujourd'hui.",
          "Quelque chose alourdit l'air autour de toi.",
          "Tu portes quelque chose que tu n'as pas nommé.",
        ],
        léger:   [
          "Quelque chose en toi cherche le calme.",
          "Il y a une légèreté qui commence à revenir.",
          "Quelque chose s'allège, doucement.",
        ],
        rugueux: [
          "Quelque chose résiste en toi aujourd'hui.",
          "Ça frotte, quelque part. C'est normal.",
          "Il n'y a rien à lisser pour l'instant.",
        ],
        doux:    [
          "Tu peux rester ici un moment.",
          "Il y a une douceur possible, même maintenant.",
          "Quelque chose en toi sait se ménager.",
        ],
        chaud:   [
          "Quelque chose couve, intérieurement.",
          "Il y a de la vie là-dedans, même si c'est tendu.",
          "Tu n'es pas obligé·e de refroidir.",
        ],
        froid:   [
          "Quelque chose ralentit en toi aujourd'hui.",
          "Tu peux rester ici sans résoudre quoi que ce soit.",
          "Il n'y a rien à résoudre pour l'instant.",
        ],
      },
      default: "Tu peux rester ici un moment.",
    },
  },
}

function selectPhrase(ritual, world) {
  const texture = ritual.texture
  const pool = world.phrases.byTexture[texture]
  if (!pool) return world.phrases.default
  const colorIdx = RITUAL_COLORS.findIndex(c => c.hex === ritual.color)
  return pool[Math.abs(colorIdx) % pool.length]
}

// ─── LOGO NÉYA ────────────────────────────────────────────────────────────────

function NeyaLogo({ size = 'sm', opacity = 1, className = '' }) {
  const scales = {
    sm: { star: 13, text: 10 },
    md: { star: 18, text: 13 },
    lg: { star: 24, text: 16 },
  }
  const s = scales[size]
  return (
    <div className={`flex flex-col items-center gap-1.5 select-none ${className}`} style={{ opacity }}>
      <svg width={s.star} height={s.star} viewBox="0 0 24 24" fill="none">
        <path
          d="M12 1.5 L13.2 9.8 L20.5 6.2 L15 12 L22 15 L13.8 13.8 L15.5 22 L12 14.8 L8.5 22 L10.2 13.8 L2 15 L9 12 L3.5 6.2 L10.8 9.8 Z"
          fill={`rgba(255,255,255,${0.55 * opacity})`}
        />
      </svg>
      <span
        style={{
          fontFamily: 'Sora, sans-serif',
          fontSize: s.text,
          letterSpacing: '0.38em',
          color: `rgba(255,255,255,${0.5 * opacity})`,
          textTransform: 'uppercase',
        }}
      >
        NÉYA
      </span>
    </div>
  )
}

// ─── COMPOSANT FADE ───────────────────────────────────────────────────────────

function Fade({ children, duration = 800, delay = 0, className = '', style = {} }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => {
      requestAnimationFrame(() => setVisible(true))
    }, delay)
    return () => clearTimeout(t)
  }, [delay])
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
    <Fade className="w-full h-full relative overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(/bg-onboarding.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 20%',
        }}
      />
      {/* Voile bas pour la question */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to top, rgba(5,8,16,0.92) 0%, rgba(5,8,16,0.5) 45%, rgba(5,8,16,0.12) 100%)',
        }}
      />
      {/* Question centrée en bas */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-24 px-8">
        <p
          style={{
            fontFamily: 'Sora, sans-serif',
            fontWeight: 300,
            fontSize: 20,
            color: 'rgba(255,255,255,0.72)',
            letterSpacing: '0.1em',
            textAlign: 'center',
          }}
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
      setTimeout(() => setVisibleLines(1), 500),
      setTimeout(() => setVisibleLines(2), 1600),
      setTimeout(() => setVisibleLines(3), 2700),
      setTimeout(() => setVisibleLines(4), 4000),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  const lines = [
    { text: 'Pas une appli de méditation.', dim: true },
    { text: 'Pas un journal.', dim: true },
    { text: 'Pas un thérapeute.', dim: true },
    { text: 'Un espace pour ce que tu ressens vraiment.', dim: false },
  ]

  return (
    <Fade className="w-full h-full flex flex-col items-center justify-center px-10">
      <div className="flex flex-col items-center gap-5">
        {lines.map((line, i) => (
          <p
            key={i}
            style={{
              fontFamily: i === 3 ? 'Sora, sans-serif' : 'Inter, sans-serif',
              fontWeight: 300,
              fontSize: i === 3 ? 18 : 15,
              color: i === 3 ? 'rgba(255,255,255,0.78)' : 'rgba(255,255,255,0.36)',
              letterSpacing: '0.04em',
              textAlign: 'center',
              opacity: visibleLines > i ? 1 : 0,
              transition: 'opacity 700ms ease',
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
      className="w-full h-full flex flex-col items-center justify-center px-10 gap-16"
      style={{ background: 'linear-gradient(to bottom, #050810 0%, #060c10 100%)' }}
    >
      <p
        style={{
          fontFamily: 'Sora, sans-serif',
          fontWeight: 300,
          fontSize: 20,
          color: 'rgba(255,255,255,0.62)',
          lineHeight: 2,
          letterSpacing: '0.04em',
          textAlign: 'center',
        }}
      >
        T'as pas besoin<br />d'aller bien<br />pour commencer.
      </p>
      <button
        onClick={e => { e.stopPropagation(); onEnter() }}
        style={{
          fontFamily: 'Sora, sans-serif',
          fontSize: 11,
          letterSpacing: '0.4em',
          color: 'rgba(255,255,255,0.32)',
          borderBottom: '1px solid rgba(255,255,255,0.12)',
          paddingBottom: 4,
          background: 'none',
          border: 'none',
          borderBottom: '1px solid rgba(255,255,255,0.12)',
          cursor: 'pointer',
          transition: 'color 600ms ease',
        }}
        onMouseEnter={e => e.target.style.color = 'rgba(255,255,255,0.65)'}
        onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.32)'}
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
  if (type === 'pluie')        { filter.type = 'highpass';  filter.frequency.value = 2200 }
  else if (type === 'vent')    { filter.type = 'bandpass';  filter.frequency.value = 380; filter.Q.value = 0.4 }
  else if (type === 'feu')     { filter.type = 'lowpass';   filter.frequency.value = 280 }

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
  const bgColor = ritual.color
    ? `radial-gradient(ellipse at center 38%, ${ritual.color}22 0%, #050810 62%)`
    : '#050810'

  return (
    <div className="w-full h-full absolute inset-0">
      {/* Fond réactif */}
      <div
        className="absolute inset-0 transition-all duration-[1400ms] ease-out"
        style={{ background: bgColor }}
      />
      <Fade key={step} duration={600} className="w-full h-full flex items-center justify-center relative z-10">
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
  // Positions organiques — pas de grille
  const positions = [
    { top: '15%', left: '22%' },
    { top: '12%', left: '60%' },
    { top: '27%', left: '80%' },
    { top: '46%', left: '83%' },
    { top: '62%', left: '70%' },
    { top: '68%', left: '36%' },
    { top: '55%', left: '14%' },
    { top: '34%', left: '9%' },
  ]
  const baseSizes = [40, 36, 48, 38, 44, 42, 34, 46]

  return (
    <div className="w-full h-full relative">
      <p
        className="absolute top-14 left-1/2 -translate-x-1/2"
        style={{ fontFamily: 'Sora', fontSize: 10, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.18)' }}
      >
        UNE COULEUR
      </p>

      {RITUAL_COLORS.map((c, i) => {
        const isSelected = selected === c.hex
        const size = isSelected ? baseSizes[i] + 16 : baseSizes[i]
        return (
          <button
            key={c.hex}
            onClick={() => onSelect(c.hex)}
            aria-label={c.label}
            style={{
              position: 'absolute',
              top: positions[i].top,
              left: positions[i].left,
              width: size,
              height: size,
              borderRadius: '50%',
              background: c.hex,
              opacity: selected && !isSelected ? 0.18 : 0.82,
              boxShadow: isSelected ? `0 0 32px ${c.hex}80, 0 0 12px ${c.hex}50` : 'none',
              transform: isSelected ? 'scale(1.1) translate(-8px, -8px)' : 'translate(-50%, -50%)',
              filter: 'saturate(0.6) brightness(0.88)',
              transition: 'all 0.55s ease',
              cursor: 'pointer',
              border: 'none',
            }}
          />
        )
      })}

      {selected && (
        <Fade className="absolute bottom-14 left-1/2 -translate-x-1/2">
          <button
            onClick={onNext}
            style={{
              fontFamily: 'Sora',
              fontSize: 10,
              letterSpacing: '0.32em',
              color: 'rgba(255,255,255,0.3)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
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
    setTimeout(() => setIsolated(null), 850)
  }

  // Positions spatiales libres — le mot se pose dans l'espace
  const posMap = {
    lourd:   { top: '17%', left: '50%', tx: '-50%' },
    léger:   { top: '30%', left: '74%', tx: '0' },
    rugueux: { top: '43%', left: '22%', tx: '0' },
    doux:    { top: '55%', left: '66%', tx: '0' },
    chaud:   { top: '68%', left: '36%', tx: '0' },
    froid:   { top: '80%', left: '58%', tx: '0' },
  }

  return (
    <div className="w-full h-full relative">
      <p
        className="absolute top-14 left-1/2 -translate-x-1/2"
        style={{ fontFamily: 'Sora', fontSize: 10, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.18)' }}
      >
        UNE SENSATION
      </p>

      {isolated ? (
        <Fade key={isolated} className="absolute inset-0 flex items-center justify-center">
          <p
            style={{
              fontFamily: 'Sora',
              fontWeight: 300,
              fontSize: 40,
              color: 'rgba(255,255,255,0.82)',
              letterSpacing: '0.2em',
            }}
          >
            {isolated}
          </p>
        </Fade>
      ) : (
        RITUAL_TEXTURES.map(word => {
          const pos = posMap[word]
          return (
            <button
              key={word}
              onClick={() => handleSelect(word)}
              style={{
                position: 'absolute',
                top: pos.top,
                left: pos.left,
                transform: `translateX(${pos.tx})`,
                fontFamily: 'Sora',
                fontWeight: 300,
                fontSize: 22,
                letterSpacing: '0.18em',
                color: selected === word ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.2)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                transition: 'color 0.4s ease',
              }}
            >
              {word}
            </button>
          )
        })
      )}

      {selected && !isolated && (
        <Fade className="absolute bottom-14 left-1/2 -translate-x-1/2">
          <button
            onClick={onNext}
            style={{
              fontFamily: 'Sora',
              fontSize: 10,
              letterSpacing: '0.32em',
              color: 'rgba(255,255,255,0.3)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
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
    { key: 'vent',    symbol: '∿',  label: 'vent' },
    { key: 'feu',     symbol: '◦',  label: 'feu' },
    { key: 'silence', symbol: '—',  label: 'silence' },
  ]

  return (
    <div className="w-full h-full relative flex items-center justify-center">
      <p
        className="absolute top-14 left-1/2 -translate-x-1/2"
        style={{ fontFamily: 'Sora', fontSize: 10, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.18)' }}
      >
        UN SON
      </p>
      <div className="flex flex-col gap-10 items-center">
        {soundItems.map(({ key, symbol, label }) => {
          const isSelected = selected === key
          return (
            <button
              key={key}
              onClick={() => handleSelect(key)}
              style={{
                fontFamily: 'Sora',
                fontWeight: 300,
                fontSize: 20,
                letterSpacing: '0.18em',
                color: isSelected ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'baseline',
                gap: 14,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                transform: isSelected ? 'scale(1.06)' : 'scale(1)',
                transition: 'all 0.45s ease',
              }}
            >
              <span style={{ fontSize: 13, opacity: 0.45 }}>{symbol}</span>
              <span>{label}</span>
              {/* Indicateur sonore animé */}
              {isSelected && key !== 'silence' && !muted && (
                <span style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 12, marginLeft: 4 }}>
                  {[1, 0.6, 0.8, 0.5, 0.9].map((h, i) => (
                    <span
                      key={i}
                      style={{
                        width: 2,
                        height: `${h * 12}px`,
                        background: 'rgba(255,255,255,0.4)',
                        borderRadius: 1,
                        animation: `soundbar ${0.5 + i * 0.12}s ${i * 0.08}s ease-in-out infinite alternate`,
                      }}
                    />
                  ))}
                </span>
              )}
            </button>
          )
        })}
      </div>
      <style>{`
        @keyframes soundbar {
          from { transform: scaleY(0.3); opacity: 0.3; }
          to   { transform: scaleY(1);   opacity: 0.7; }
        }
      `}</style>
      {selected && (
        <Fade className="absolute bottom-14 left-1/2 -translate-x-1/2">
          <button
            onClick={onNext}
            style={{
              fontFamily: 'Sora',
              fontSize: 10,
              letterSpacing: '0.32em',
              color: 'rgba(255,255,255,0.3)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
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
    const t2 = setTimeout(() => setPhase('phrase'), 3200)
    return () => { clearTimeout(t1); clearTimeout(t2); stopSoundRef.current() }
  }, []) // eslint-disable-line

  useEffect(() => {
    if (phase !== 'phrase') return
    let i = 0
    const interval = setInterval(() => {
      setDisplayedPhrase(fullPhrase.slice(0, i + 1))
      i++
      if (i >= fullPhrase.length) clearInterval(interval)
    }, 44)
    return () => clearInterval(interval)
  }, [phase, fullPhrase])

  const textureSpeed = {
    lourd: '18s', léger: '28s', rugueux: '12s', doux: '22s', chaud: '20s', froid: '25s',
  }
  const speed = textureSpeed[ritual.texture] || '20s'

  return (
    <div
      className="w-full h-full absolute inset-0"
      style={{
        opacity: phase === 'black' ? 0 : 1,
        transition: 'opacity 900ms ease',
      }}
    >
      {/* Image de fond Brume */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(/bg-brume.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          animation: `worldBreathe ${speed} ease-in-out infinite`,
        }}
      />

      {/* Voile coloré selon ritual */}
      <div
        className="absolute inset-0"
        style={{
          background: ritual.color
            ? `radial-gradient(ellipse at 50% 75%, ${ritual.color}30 0%, transparent 58%)`
            : 'transparent',
          transition: 'background 2s ease',
        }}
      />

      {/* Voile Brume — donne la palette */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to top, ${world.palette[0]}f2 0%, ${world.palette[0]}aa 30%, ${world.palette[1]}66 65%, rgba(13,27,42,0.2) 100%)`,
        }}
      />

      <style>{`
        @keyframes worldBreathe {
          0%, 100% { transform: scale(1);    filter: brightness(1); }
          50%       { transform: scale(1.04); filter: brightness(1.08); }
        }
        @keyframes cerfdrift {
          0%, 100% { transform: translate(0px,  0px); }
          33%       { transform: translate(5px,  -4px); }
          66%       { transform: translate(-3px,  4px); }
        }
      `}</style>

      {/* Logo NÉYA */}
      {phase !== 'black' && (
        <Fade duration={1400} className="absolute top-12 left-1/2 -translate-x-1/2">
          <NeyaLogo size="sm" />
        </Fade>
      )}

      {/* Cerf — l'animal qui était déjà là */}
      <div
        className="absolute inset-0 flex items-end justify-center pointer-events-none"
        style={{ paddingBottom: '5%', animation: 'cerfdrift 24s ease-in-out infinite' }}
      >
        <img
          src="/cerf.svg"
          alt=""
          aria-hidden="true"
          style={{ width: '55vw', maxWidth: 280, opacity: 0.6, filter: 'brightness(1.4) blur(0.3px)' }}
        />
      </div>

      {/* Phrase */}
      {phase === 'phrase' && (
        <Fade duration={700} className="absolute inset-0 flex items-center justify-center px-10" style={{ paddingBottom: '20%' }}>
          <p
            style={{
              fontFamily: 'Sora',
              fontWeight: 300,
              fontSize: 17,
              color: 'rgba(255,255,255,0.62)',
              textAlign: 'center',
              lineHeight: 1.9,
              letterSpacing: '0.06em',
            }}
          >
            {displayedPhrase}
          </p>
        </Fade>
      )}

      {/* Lien Espace Vrai */}
      {phase === 'phrase' && displayedPhrase.length === fullPhrase.length && (
        <Fade duration={1400} className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <button
            onClick={onGoVrai}
            style={{
              fontFamily: 'Sora',
              fontSize: 10,
              letterSpacing: '0.32em',
              color: 'rgba(255,255,255,0.18)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'color 600ms ease',
            }}
            onMouseEnter={e => e.target.style.color = 'rgba(255,255,255,0.48)'}
            onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.18)'}
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
  const entries = Array.from({ length: 22 }, (_, i) => ({
    id: i,
    color: colors[i % colors.length],
    x: 6 + Math.random() * 88,
    y: 6 + Math.random() * 88,
    size: 4 + Math.random() * 10,
    opacity: 0.12 + Math.random() * 0.38,
    driftX: (Math.random() - 0.5) * 30,
    driftY: (Math.random() - 0.5) * 20,
    period: 14 + Math.random() * 24,
    delay: Math.random() * 14,
    immobile: Math.random() < 0.3,
  }))

  // La présence de l'utilisateur
  entries.push({
    id: 99,
    color: userColor || '#4f46e5',
    x: 32 + Math.random() * 36,
    y: 32 + Math.random() * 36,
    size: 11,
    opacity: 0.62,
    driftX: (Math.random() - 0.5) * 16,
    driftY: (Math.random() - 0.5) * 12,
    period: 18 + Math.random() * 6,
    delay: 2,
    immobile: false,
  })

  return entries
}

function EspaceVrai({ ritual, world, onRestart }) {
  const flux = useRef(generateFakeFlux(ritual.color)).current
  const [showRestart, setShowRestart] = useState(false)

  // Affiche le bouton restart après 12s — discret, pas pressant
  useEffect(() => {
    const t = setTimeout(() => setShowRestart(true), 12000)
    return () => clearTimeout(t)
  }, [])

  return (
    <Fade className="w-full h-full absolute inset-0" duration={1600}>
      {/* Image de fond */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(/bg-vrai.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      {/* Voile Brume + opacification */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to top, ${world.palette[0]}f8 0%, ${world.palette[0]}d0 35%, ${world.palette[1]}88 70%, ${world.palette[0]}99 100%)`,
        }}
      />

      {/* Flux de présences SVG */}
      <svg className="absolute inset-0 w-full h-full" style={{ overflow: 'visible' }}>
        <defs>
          <filter id="psoft"><feGaussianBlur stdDeviation="2.2"/></filter>
          <filter id="puser"><feGaussianBlur stdDeviation="3.5"/></filter>
        </defs>
        {flux.map(p => (
          <circle
            key={p.id}
            cx={`${p.x}%`}
            cy={`${p.y}%`}
            r={p.size}
            fill={p.color}
            opacity={p.opacity}
            filter={p.id === 99 ? 'url(#puser)' : 'url(#psoft)'}
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
                0%,100% { transform:translate(0,0); }
                25%     { transform:translate(${p.driftX * 0.35}px,${p.driftY * 0.25}px); }
                50%     { transform:translate(${p.driftX}px,${p.driftY}px); }
                75%     { transform:translate(${p.driftX * 0.55}px,${p.driftY * 0.75}px); }
              }
            `)
            .join('')}
        </style>
      </svg>

      {/* Message implicite */}
      <Fade duration={2400} delay={800} className="absolute bottom-20 left-1/2 -translate-x-1/2 text-center">
        <p style={{ fontFamily: 'Sora', fontSize: 11, letterSpacing: '0.22em', color: 'rgba(255,255,255,0.16)' }}>
          tu n'es pas seul·e
        </p>
      </Fade>

      {/* Bouton nouveau rituel — apparaît après 12s */}
      {showRestart && (
        <Fade duration={1200} className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <button
            onClick={onRestart}
            style={{
              fontFamily: 'Sora',
              fontSize: 9,
              letterSpacing: '0.3em',
              color: 'rgba(255,255,255,0.14)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'color 600ms ease',
            }}
            onMouseEnter={e => e.target.style.color = 'rgba(255,255,255,0.4)'}
            onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.14)'}
          >
            nouveau rituel
          </button>
        </Fade>
      )}

      {/* Logo discret */}
      <Fade duration={2000} delay={400} className="absolute top-10 left-1/2 -translate-x-1/2">
        <NeyaLogo size="sm" opacity={0.22} />
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

  // Nouveau rituel — repart du rituel, pas de l'onboarding
  const handleRestart = useCallback(() => {
    setRitual(INITIAL_RITUAL)
    goTo('ritual', 0)
  }, [goTo])

  return (
    <div
      className="w-full h-full relative overflow-hidden"
      style={{ background: '#050810', fontFamily: 'Inter, sans-serif', color: 'white' }}
    >
      {/* Bouton mute — présent partout */}
      <button
        onClick={() => setMuted(m => !m)}
        aria-label={muted ? 'Activer le son' : 'Couper le son'}
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          zIndex: 50,
          fontFamily: 'Sora',
          fontSize: 11,
          color: 'rgba(255,255,255,0.18)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          letterSpacing: '0.1em',
          transition: 'color 400ms ease',
        }}
        onMouseEnter={e => e.target.style.color = 'rgba(255,255,255,0.5)'}
        onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.18)'}
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
        <EspaceVrai
          ritual={ritual}
          world={world}
          onRestart={handleRestart}
        />
      )}
    </div>
  )
}
