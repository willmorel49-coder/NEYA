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
    bgImage: 'url(/bg-brume.png)',
    animalFilter: 'brightness(1.4) blur(0.3px)',
    animationSpeed: 'slow',
    phrases: {
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

  foret: {
    palette: ['#0a1a0e', '#162a18', '#1e3d24'],
    bgImage: 'url(/bg-foret.png)',
    animalFilter: 'hue-rotate(110deg) saturate(0.9) brightness(1.3) blur(0.3px)',
    animationSpeed: 'slow',
    phrases: {
      byTexture: {
        lourd:   [
          "La forêt accueille aussi ce qui est lourd.",
          "Certaines racines s'enfoncent dans l'obscurité.",
          "Être dense, c'est aussi une forme de vie.",
        ],
        léger:   [
          "Quelque chose pousse ici, silencieusement.",
          "Même l'air entre les arbres a de l'espace.",
          "Il y a une légèreté dans ce qui persiste.",
        ],
        rugueux: [
          "Rugueux, comme l'écorce. Ça tient quand même.",
          "Ce qui résiste a aussi ses textures.",
          "Pas besoin d'être lisse pour traverser.",
        ],
        doux:    [
          "Le sol de la forêt amortit les pas.",
          "Il y a une douceur dans ce qui dure.",
          "Certains endroits existent pour accueillir.",
        ],
        chaud:   [
          "Quelque chose grandit en toi, même sous l'ombre.",
          "Une chaleur intérieure, comme la sève qui monte.",
          "Être vivant, ça chauffe parfois.",
        ],
        froid:   [
          "Le froid de la forêt est vieux et patient.",
          "Rien n'est pressé ici.",
          "Le calme peut être une forme de force.",
        ],
      },
      default: "Certains endroits existent pour accueillir.",
    },
  },

  cosmos: {
    palette: ['#0a0818', '#160d3a', '#1e1050'],
    bgImage: 'url(/bg-cosmos.png)',
    animalFilter: 'hue-rotate(270deg) saturate(0.85) brightness(1.6) blur(0.3px)',
    animationSpeed: 'slow',
    phrases: {
      byTexture: {
        lourd:   [
          "Même les étoiles portent leur propre poids.",
          "Loin du sol, quelque chose reste.",
          "L'espace n'allège pas tout — il donne de la place.",
        ],
        léger:   [
          "Quelque chose en toi sait flotter.",
          "Il y a de l'infini dans ce moment.",
          "Léger comme ce qui ne cherche plus à se justifier.",
        ],
        rugueux: [
          "Même le cosmos a ses aspérités invisibles.",
          "Ce qui accroche peut aussi guider.",
          "La rugosité n'empêche pas le vol.",
        ],
        doux:    [
          "Là-haut, tout est plus silencieux.",
          "L'espace entre les étoiles n'est pas vide.",
          "Il y a une douceur dans l'immensité.",
        ],
        chaud:   [
          "Quelque chose brûle ici, depuis longtemps.",
          "Il y a de la chaleur même dans l'espace.",
          "Un feu lointain qui dure.",
        ],
        froid:   [
          "Le froid du cosmos est pur, pas hostile.",
          "Quelque chose se cristallise quand tout ralentit.",
          "La distance peut être une forme de clarté.",
        ],
      },
      default: "Il y a de l'infini dans ce moment.",
    },
  },

  feu: {
    palette: ['#1a0800', '#2e1000', '#4a1c00'],
    bgImage: 'url(/bg-feu.png)',
    animalFilter: 'hue-rotate(30deg) saturate(1.2) brightness(1.6) blur(0.3px)',
    animationSpeed: 'fast',
    phrases: {
      byTexture: {
        lourd:   [
          "Ce qui brûle en toi n'est pas un défaut.",
          "Quelque chose est intense aujourd'hui. C'est réel.",
          "Le poids du feu est différent — il consume, il libère.",
        ],
        léger:   [
          "Le feu peut aussi danser.",
          "Il y a une légèreté dans ce qui brûle vraiment.",
          "Quelque chose se consume pour laisser de la place.",
        ],
        rugueux: [
          "Brut, direct, vif — c'est une façon d'être présent.",
          "Ce qui frotte peut s'enflammer.",
          "L'intensité a ses propres textures.",
        ],
        doux:    [
          "Même le feu a ses braises douces.",
          "Il y a un feu calme dans les choses qui durent.",
          "Ce qui couve n'a pas besoin d'exploser.",
        ],
        chaud:   [
          "Quelque chose t'habite pleinement en ce moment.",
          "Cette chaleur-là, tu peux lui faire confiance.",
          "Être habité, c'est être vivant.",
        ],
        froid:   [
          "Même quand le froid vient, la braise reste.",
          "Quelque chose résiste sous la surface.",
          "Le froid ne tue pas ce qui est vraiment allumé.",
        ],
      },
      default: "Ce qui brûle en toi n'est pas un défaut.",
    },
  },

  eau: {
    palette: ['#04121c', '#081e30', '#0c2e44'],
    bgImage: 'url(/bg-eau.png)',
    animalFilter: 'hue-rotate(190deg) saturate(1.1) brightness(1.5) blur(0.3px)',
    animationSpeed: 'slow',
    phrases: {
      byTexture: {
        lourd:   [
          "L'eau porte aussi ce qui est lourd.",
          "Quelque chose coule mais ne disparaît pas.",
          "Même dense, tu flottes.",
        ],
        léger:   [
          "L'eau sait comment être légère.",
          "Quelque chose en toi cherche sa surface.",
          "Il y a une fluidité dans les jours qui passent.",
        ],
        rugueux: [
          "L'eau adoucit ce qui résiste, avec le temps.",
          "Même rugueux, le fond peut être traversé.",
          "Quelque chose érode doucement.",
        ],
        doux:    [
          "L'eau se souvient des formes qu'elle a traversées.",
          "Il y a une douceur dans ce qui s'écoule.",
          "Laisser couler n'est pas renoncer.",
        ],
        chaud:   [
          "Quelque chose est vivant et en mouvement.",
          "Cette chaleur-là, l'eau la garde longtemps.",
          "Ce qui coule garde sa propre température.",
        ],
        froid:   [
          "Une fraîcheur qui réveille sans brusquer.",
          "L'eau froide est honnête.",
          "Ce froid-là nettoie quelque chose.",
        ],
      },
      default: "Laisser couler n'est pas renoncer.",
    },
  },

  vide: {
    palette: ['#0c0c0c', '#141414', '#1e1e1e'],
    bgImage: 'url(/bg-vide.png)',
    animalFilter: 'saturate(0) brightness(1.8) blur(0.3px)',
    animationSpeed: 'slow',
    phrases: {
      byTexture: {
        lourd:   [
          "Le vide accueille même ce qui est lourd.",
          "Ici, le poids n'a pas besoin de se justifier.",
          "Silence total. C'est suffisant.",
        ],
        léger:   [
          "Il n'y a rien à faire ici.",
          "Le vide n'est pas une absence — c'est un espace.",
          "Quelque chose respire quand tout s'arrête.",
        ],
        rugueux: [
          "Même dans le vide, tu existes.",
          "Ce qui résiste peut aussi se poser.",
          "Pas de lissage nécessaire ici.",
        ],
        doux:    [
          "Il n'y a rien à tenir.",
          "La paix n'est pas l'absence de quelque chose.",
          "Tu peux ne rien être pour un moment.",
        ],
        chaud:   [
          "Même dans le silence, quelque chose couve.",
          "Une chaleur intérieure qui n'a pas besoin de se montrer.",
          "Être, simplement.",
        ],
        froid:   [
          "Le silence froid est l'un des plus honnêtes.",
          "Rien ne bouge. C'est bien comme ça.",
          "Ce moment ne demande rien.",
        ],
      },
      default: "Il n'y a rien à faire ici.",
    },
  },
}

// sound × texture → monde émotionnel
const WORLD_MAP = {
  pluie:   { lourd:'brume',  léger:'eau',   rugueux:'brume',  doux:'eau',   chaud:'eau',   froid:'brume' },
  vent:    { lourd:'foret',  léger:'cosmos', rugueux:'foret',  doux:'cosmos', chaud:'cosmos', froid:'foret' },
  feu:     { lourd:'feu',    léger:'foret',  rugueux:'feu',    doux:'foret',  chaud:'feu',   froid:'foret' },
  silence: { lourd:'brume',  léger:'vide',   rugueux:'brume',  doux:'vide',  chaud:'vide',  froid:'brume' },
}

const WORLD_NAMES = { brume:'brume', foret:'forêt', cosmos:'cosmos', feu:'feu', eau:'eau', vide:'vide' }

// ─── HISTOIRE SILENCIEUSE ─────────────────────────────────────────────────────

function loadHistory() {
  try { return JSON.parse(localStorage.getItem('neya_history') || '[]') } catch { return [] }
}

function saveToHistory(ritual, worldKey) {
  try {
    const h = loadHistory()
    h.unshift({ ts: Date.now(), color: ritual.color, texture: ritual.texture, sound: ritual.sound, world: worldKey })
    if (h.length > 90) h.splice(90)
    localStorage.setItem('neya_history', JSON.stringify(h))
  } catch {}
}

function selectWorld(ritual) {
  if (!ritual.sound || !ritual.texture) return 'brume'
  return WORLD_MAP[ritual.sound]?.[ritual.texture] ?? 'brume'
}

function selectPhrase(ritual, world) {
  const texture = ritual.texture
  const pool = world.phrases.byTexture[texture]
  if (!pool) return world.phrases.default
  const colorIdx = RITUAL_COLORS.findIndex(c => c.hex === ritual.color)
  return pool[Math.abs(colorIdx) % pool.length]
}

// ─── LOGO NÉYA + SPLASH ───────────────────────────────────────────────────────

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

function NeyaSplash({ onDone, hasHistory }) {
  const [visible, setVisible] = useState(false)
  const [fading, setFading] = useState(false)
  const [showReturn, setShowReturn] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 200)
    const t2 = setTimeout(() => setShowReturn(hasHistory), 900)
    const t3 = setTimeout(() => setFading(true), 2200)
    const t4 = setTimeout(() => onDone(), 3100)
    return () => [t1, t2, t3, t4].forEach(clearTimeout)
  }, [onDone, hasHistory])

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-50"
      style={{ background: '#050810', opacity: fading ? 0 : 1, transition: 'opacity 900ms ease' }}>
      <style>{`
        @keyframes splashpulse {
          0%, 100% { opacity: 0.72; transform: scale(1); }
          50%       { opacity: 1;    transform: scale(1.03); }
        }
        @keyframes returnfade {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div style={{ opacity: visible ? 1 : 0, transition: 'opacity 1400ms ease', animation: visible ? 'splashpulse 3.5s ease-in-out infinite' : 'none' }}>
        <NeyaLogo size="lg" />
      </div>
      {showReturn && (
        <p style={{
          fontFamily: 'Sora', fontSize: 9, letterSpacing: '0.3em',
          color: 'rgba(255,255,255,0.18)', marginTop: 28,
          animation: 'returnfade 1000ms ease forwards',
        }}>
          tu es revenu·e
        </p>
      )}
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
  const breathePeriods = [14, 18, 12, 20, 16, 22, 15, 19]
  const [flashLabel, setFlashLabel] = useState(null)

  const handleSelect = (hex, label) => {
    onSelect(hex)
    setFlashLabel(label)
    setTimeout(() => setFlashLabel(null), 1200)
  }

  return (
    <div className="w-full h-full relative">
      <style>{`
        ${RITUAL_COLORS.map((c, i) => `
          @keyframes colorBreathe${i} {
            0%, 100% { box-shadow: none; transform: translate(-50%, -50%) scale(1); }
            50%       { box-shadow: 0 0 18px ${c.hex}44; transform: translate(-50%, -50%) scale(1.06); }
          }
        `).join('')}
      `}</style>

      <p
        className="absolute top-14 left-1/2 -translate-x-1/2"
        style={{ fontFamily: 'Sora', fontSize: 10, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.18)' }}
      >
        UNE COULEUR
      </p>

      {/* Flash du label couleur */}
      {flashLabel && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 2 }}>
          <p style={{ fontFamily: 'Sora', fontSize: 11, letterSpacing: '0.35em', color: 'rgba(255,255,255,0.28)', animation: 'colorlabelfade 1200ms ease forwards' }}>
            {flashLabel}
          </p>
        </div>
      )}
      <style>{`@keyframes colorlabelfade { 0%{opacity:0} 20%{opacity:1} 80%{opacity:1} 100%{opacity:0} }`}</style>

      {RITUAL_COLORS.map((c, i) => {
        const isSelected = selected === c.hex
        const size = isSelected ? baseSizes[i] + 16 : baseSizes[i]
        return (
          <button
            key={c.hex}
            onClick={() => handleSelect(c.hex, c.label)}
            aria-label={c.label}
            style={{
              position: 'absolute',
              top: positions[i].top,
              left: positions[i].left,
              width: size,
              height: size,
              borderRadius: '50%',
              background: c.hex,
              opacity: selected && !isSelected ? 0.15 : 0.82,
              boxShadow: isSelected ? `0 0 32px ${c.hex}80, 0 0 12px ${c.hex}50` : 'none',
              transform: isSelected ? 'scale(1.1) translate(-8px, -8px)' : undefined,
              filter: 'saturate(0.6) brightness(0.88)',
              animation: !isSelected && !selected ? `colorBreathe${i} ${breathePeriods[i]}s ease-in-out infinite` : 'none',
              transition: 'opacity 0.55s ease, box-shadow 0.55s ease, transform 0.55s ease',
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

function WorldReveal({ ritual, world, worldKey, onGoVrai, muted, onAmbienceStart }) {
  const [phase, setPhase] = useState('black') // black → world → name → phrase
  const [displayedPhrase, setDisplayedPhrase] = useState('')
  const fullPhrase = selectPhrase(ritual, world)
  const stopSoundRef = useRef(() => {})

  useEffect(() => {
    const t1 = setTimeout(() => {
      setPhase('world')
      if (!muted && ritual.sound && ritual.sound !== 'silence') {
        const stop = startAmbience(ritual.sound, 0.04)
        stopSoundRef.current = stop
        onAmbienceStart?.(stop)
      }
    }, 1000)
    const t2 = setTimeout(() => setPhase('name'), 2800)
    const t3 = setTimeout(() => setPhase('phrase'), 4600)
    // Ne pas stopper le son à l'unmount — App gère l'arrêt
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
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
      style={{ opacity: phase === 'black' ? 0 : 1, transition: 'opacity 1100ms ease' }}
    >
      {/* Image de fond du monde */}
      <div className="absolute inset-0" style={{ backgroundImage: world.bgImage, backgroundSize: 'cover', backgroundPosition: 'center', animation: `worldBreathe ${speed} ease-in-out infinite` }} />

      {/* Voile coloré selon ritual */}
      <div className="absolute inset-0" style={{ background: ritual.color ? `radial-gradient(ellipse at 50% 75%, ${ritual.color}30 0%, transparent 58%)` : 'transparent', transition: 'background 2s ease' }} />

      {/* Voile monde — palette */}
      <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${world.palette[0]}f2 0%, ${world.palette[0]}aa 30%, ${world.palette[1]}66 65%, rgba(13,27,42,0.2) 100%)` }} />

      <style>{`
        @keyframes worldBreathe {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.04); }
        }
        @keyframes cerfdrift {
          0%, 100% { transform: translate(0px,  0px) scale(1); }
          33%       { transform: translate(5px,  -4px) scale(1.016); }
          66%       { transform: translate(-3px,  4px) scale(0.986); }
        }
        @keyframes worldnameappear {
          from { opacity: 0; letter-spacing: 0.65em; }
          to   { opacity: 1; letter-spacing: 0.5em; }
        }
      `}</style>

      {/* Logo NÉYA */}
      {phase !== 'black' && (
        <Fade duration={1600} className="absolute top-12 left-1/2 -translate-x-1/2">
          <NeyaLogo size="sm" />
        </Fade>
      )}

      {/* Nom du monde — révélé au centre avant la phrase */}
      {(phase === 'name' || phase === 'phrase') && (
        <div className="absolute" style={{ top: '30%', left: '50%', transform: 'translateX(-50%)' }}>
          <p style={{
            fontFamily: 'Sora', fontSize: 9, textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.20)', whiteSpace: 'nowrap',
            animation: 'worldnameappear 1400ms ease forwards',
          }}>
            {WORLD_NAMES[worldKey] || worldKey}
          </p>
        </div>
      )}

      {/* Cerf — l'animal qui était déjà là */}
      <div className="absolute inset-0 flex items-end justify-center pointer-events-none" style={{ paddingBottom: '5%', animation: 'cerfdrift 26s ease-in-out infinite' }}>
        <img src="/cerf.svg" alt="" aria-hidden="true" style={{ width: '55vw', maxWidth: 280, opacity: 0.6, filter: world.animalFilter }} />
      </div>

      {/* Phrase */}
      {phase === 'phrase' && (
        <Fade duration={700} className="absolute inset-0 flex items-center justify-center px-10" style={{ paddingBottom: '18%' }}>
          <p style={{ fontFamily: 'Sora', fontWeight: 300, fontSize: 17, color: 'rgba(255,255,255,0.62)', textAlign: 'center', lineHeight: 1.9, letterSpacing: '0.06em' }}>
            {displayedPhrase}
          </p>
        </Fade>
      )}

      {/* Lien Espace Vrai */}
      {phase === 'phrase' && displayedPhrase.length === fullPhrase.length && (
        <Fade duration={1400} className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <button onClick={onGoVrai} style={{ fontFamily: 'Sora', fontSize: 10, letterSpacing: '0.32em', color: 'rgba(255,255,255,0.18)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 600ms ease' }}
            onMouseEnter={e => e.target.style.color = 'rgba(255,255,255,0.48)'}
            onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.18)'}>
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

function EspaceVrai({ ritual, world, worldKey, history, onRestart }) {
  const flux = useRef(generateFakeFlux(ritual.color)).current
  const [showRestart, setShowRestart] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setShowRestart(true), 12000)
    return () => clearTimeout(t)
  }, [])

  // Histoire silencieuse — présences fantômes des rituels passés
  const historyDots = history.slice(0, 40).map((entry, i) => ({
    id: `h${i}`,
    color: entry.color || '#4f46e5',
    x: 5 + ((i * 23 + Math.round(Math.sin(i * 1.7) * 900)) % 90 + 90) % 90,
    y: 8 + ((i * 17 + Math.round(Math.cos(i * 1.3) * 700)) % 82 + 82) % 82,
    size: 1.4 + (i % 3) * 0.6,
    opacity: 0.05 + Math.min(i * 0.003, 0.12),
  }))

  return (
    <Fade className="w-full h-full absolute inset-0" duration={1800}>
      {/* Image de fond du monde — très opacifiée, transcende le monde */}
      <div className="absolute inset-0" style={{ backgroundImage: world.bgImage, backgroundSize: 'cover', backgroundPosition: 'center' }} />

      {/* Voile très épais — l'espace vrai est au-delà du monde */}
      <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${world.palette[0]}fd 0%, ${world.palette[0]}ee 35%, ${world.palette[1]}cc 75%, ${world.palette[0]}bb 100%)` }} />

      {/* SVG — histoire silencieuse + flux de présences */}
      <svg className="absolute inset-0 w-full h-full" style={{ overflow: 'visible' }}>
        <defs>
          <filter id="psoft"><feGaussianBlur stdDeviation="2.2"/></filter>
          <filter id="puser"><feGaussianBlur stdDeviation="3.5"/></filter>
          <filter id="phistory"><feGaussianBlur stdDeviation="1.0"/></filter>
        </defs>

        {/* Présences passées — traces silencieuses */}
        {historyDots.map(p => (
          <circle key={p.id} cx={`${p.x}%`} cy={`${p.y}%`} r={p.size} fill={p.color} opacity={p.opacity} filter="url(#phistory)" />
        ))}

        {/* Flux anonyme live */}
        {flux.map(p => (
          <circle key={p.id} cx={`${p.x}%`} cy={`${p.y}%`} r={p.size} fill={p.color} opacity={p.opacity}
            filter={p.id === 99 ? 'url(#puser)' : 'url(#psoft)'}
            style={{ animation: p.immobile ? 'none' : `drift-${p.id} ${p.period}s ${p.delay}s ease-in-out infinite` }} />
        ))}
        <style>
          {flux.filter(p => !p.immobile).map(p => `
            @keyframes drift-${p.id} {
              0%,100% { transform:translate(0,0); }
              25%     { transform:translate(${p.driftX * 0.35}px,${p.driftY * 0.25}px); }
              50%     { transform:translate(${p.driftX}px,${p.driftY}px); }
              75%     { transform:translate(${p.driftX * 0.55}px,${p.driftY * 0.75}px); }
            }
          `).join('')}
        </style>
      </svg>

      {/* Cerf fantôme — l'animal était là avant, il est encore là */}
      <Fade duration={3000} delay={1200} className="absolute inset-0 flex items-end justify-end pointer-events-none" style={{ paddingBottom: '8%', paddingRight: '4%' }}>
        <img src="/cerf.svg" alt="" aria-hidden="true" style={{ width: '28vw', maxWidth: 130, opacity: 0.07, filter: world.animalFilter }} />
      </Fade>

      {/* Compteur de présences passées — ultra-discret */}
      {history.length > 1 && (
        <Fade duration={2000} delay={5000} className="absolute" style={{ top: '22%', left: '50%', transform: 'translateX(-50%)' }}>
          <p style={{ fontFamily: 'Sora', fontSize: 8, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.07)', whiteSpace: 'nowrap' }}>
            {history.length} présences
          </p>
        </Fade>
      )}

      {/* Message implicite */}
      <Fade duration={2400} delay={800} className="absolute bottom-20 left-1/2 -translate-x-1/2 text-center">
        <p style={{ fontFamily: 'Sora', fontSize: 11, letterSpacing: '0.22em', color: 'rgba(255,255,255,0.16)' }}>
          tu n'es pas seul·e
        </p>
      </Fade>

      {/* Bouton nouveau rituel */}
      {showRestart && (
        <Fade duration={1200} className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <button onClick={onRestart} style={{ fontFamily: 'Sora', fontSize: 9, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.14)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 600ms ease' }}
            onMouseEnter={e => e.target.style.color = 'rgba(255,255,255,0.4)'}
            onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.14)'}>
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
  const [screen, setScreen] = useState('splash')
  const [step, setStep] = useState(0)
  const [ritual, setRitual] = useState(INITIAL_RITUAL)
  const [muted, setMuted] = useState(false)
  const [history, setHistory] = useState(() => loadHistory())
  const [blackout, setBlackout] = useState(false)
  const blackoutTimer = useRef()
  const stopAmbienceRef = useRef(() => {})

  // Transition noire cinématique entre les écrans majeurs
  const goTo = useCallback((nextScreen, nextStep = 0, withBlackout = false) => {
    if (withBlackout) {
      setBlackout(true)
      clearTimeout(blackoutTimer.current)
      blackoutTimer.current = setTimeout(() => {
        setScreen(nextScreen)
        setStep(nextStep)
        setTimeout(() => setBlackout(false), 80)
      }, 380)
    } else {
      setScreen(nextScreen)
      setStep(nextStep)
    }
  }, [])

  const worldKey = selectWorld(ritual)
  const world = WORLDS[worldKey] ?? WORLDS.brume

  const handleRitualChange = useCallback((updated) => setRitual(updated), [])

  const handleRitualStepComplete = useCallback((completedStep) => {
    if (completedStep < 2) {
      setStep(s => s + 1)
    } else {
      const completed = { ...ritual, completedAt: new Date() }
      const wk = selectWorld(completed)
      saveToHistory(completed, wk)
      setHistory(loadHistory())
      setRitual(completed)
      goTo('world', 0, true)
    }
  }, [ritual, goTo])

  const handleOnboardingNext = useCallback(() => {
    if (step < 2) setStep(s => s + 1)
    else goTo('ritual', 0, true)
  }, [step, goTo])

  const handleGoVrai = useCallback(() => goTo('vrai', 0, true), [goTo])

  const handleAmbienceStart = useCallback((stopFn) => {
    stopAmbienceRef.current = stopFn
  }, [])

  const handleRestart = useCallback(() => {
    stopAmbienceRef.current()
    stopAmbienceRef.current = () => {}
    setRitual(INITIAL_RITUAL)
    goTo('ritual', 0, true)
  }, [goTo])

  return (
    <div className="w-full h-full relative overflow-hidden" style={{ background: '#050810', fontFamily: 'Inter, sans-serif', color: 'white' }}>

      {/* Grain texture — matière picturale (DA) */}
      <div className="absolute inset-0 pointer-events-none" style={{
        zIndex: 40,
        opacity: 0.038,
        mixBlendMode: 'overlay',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: '300px 300px',
      }} />

      {/* Transition noire cinématique */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 45, background: '#050810', opacity: blackout ? 1 : 0, transition: `opacity ${blackout ? 380 : 700}ms ease` }} />

      {/* Bouton mute */}
      <button
        onClick={() => setMuted(m => !m)}
        aria-label={muted ? 'Activer le son' : 'Couper le son'}
        style={{ position: 'absolute', top: 20, right: 20, zIndex: 50, fontFamily: 'Sora', fontSize: 11, color: 'rgba(255,255,255,0.18)', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.1em', transition: 'color 400ms ease' }}
        onMouseEnter={e => e.target.style.color = 'rgba(255,255,255,0.5)'}
        onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.18)'}
      >
        {muted ? '○' : '●'}
      </button>

      {screen === 'splash'     && <NeyaSplash hasHistory={history.length > 0} onDone={() => history.length > 0 ? goTo('ritual', 0, true) : goTo('onboarding')} />}
      {screen === 'onboarding' && <Onboarding step={step} onNext={handleOnboardingNext} />}
      {screen === 'ritual'     && <RitualFlow step={step} ritual={ritual} onChange={handleRitualChange} onComplete={handleRitualStepComplete} muted={muted} />}
      {screen === 'world'      && <WorldReveal ritual={ritual} world={world} worldKey={worldKey} muted={muted} onGoVrai={handleGoVrai} onAmbienceStart={handleAmbienceStart} />}
      {screen === 'vrai'       && <EspaceVrai ritual={ritual} world={world} worldKey={worldKey} history={history} onRestart={handleRestart} />}
    </div>
  )
}
