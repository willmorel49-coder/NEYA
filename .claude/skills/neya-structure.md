# NÉYA — Architecture & Structure

> Skill lazy-loaded. Invoquer pour toute décision d'architecture, nouveaux composants, organisation.

## Règle absolue

**Single-file discipline** : Tout le code React dans `src/App.jsx`.
Ne jamais refactoriser en multi-fichiers sans accord explicite de Will.

---

## Stack

```
Frontend :  React 18.3.1 + Vite 5.4.0 + @vitejs/plugin-react
CSS :       Tailwind via CDN (https://cdn.tailwindcss.com)
State :     useState / useEffect / useRef / useCallback uniquement
Router :    Aucun — navigation par switch(screen)
Backend :   Aucun (MVP)
Tests :     Aucun (MVP)
```

## Fichiers clés

```
src/App.jsx          ← TOUT le code React (≈700 lignes)
index.html           ← Tailwind CDN + Google Fonts (Sora+Inter) + #root 100vw/100vh
src/main.jsx         ← ReactDOM.createRoot avec StrictMode
public/cerf.svg      ← Cerf placeholder SVG (à améliorer)
public/bg-onboarding.png  ← Fond onboarding-0 (fille + grotte + mandalas)
public/bg-brume.png       ← Fond monde Brume (fille + loup-esprit)
public/bg-vrai.png        ← Fond Espace Vrai (fille + orbes dans l'eau)
vite.config.js       ← Config Vite minimale avec plugin React
package.json         ← React 18.3.1 + Vite 5.4.0
ROBOT.md             ← Source de vérité du projet (≤200 lignes)
```

## État global (App.jsx)

```js
const [screen, setScreen]   = useState('onboarding')  // 'onboarding'|'ritual'|'world'|'vrai'
const [step, setStep]       = useState(0)              // step onboarding 0-2, ritual 0-2
const [ritual, setRitual]   = useState(INITIAL_RITUAL) // { color, texture, sound, completedAt }
const [muted, setMuted]     = useState(false)

// V1.1 prévu, vide pour l'instant :
// history: []  ← évolution silencieuse quotidienne
```

## Navigation

```js
switch(screen) {
  case 'onboarding': <Onboarding step={step} onNext={handleOnboardingNext} />
  case 'ritual':     <RitualFlow step={step} ritual={ritual} onChange={...} onComplete={...} muted={muted} />
  case 'world':      <WorldReveal ritual={ritual} world={world} muted={muted} onGoVrai={...} />
  case 'vrai':       <EspaceVrai ritual={ritual} world={world} />
}
```

## Composants (dans App.jsx)

```
Fade                    ← Wrapper de transition opacity 0→1 (duration configurable)
Onboarding              ← Conteneur onboarding, router step 0/1/2
  OnboardingScreen0     ← "Et toi, ça va vraiment ?" + fond bg-onboarding
  OnboardingScreen1     ← 4 lignes séquentielles (timers)
  OnboardingScreen2     ← "T'as pas besoin..." + bouton Entrer
RitualFlow              ← Conteneur ritual avec fond réactif
  RitualColor           ← 8 cercles organiques
  RitualTexture         ← 6 mots espacés + isolation 800ms
  RitualSound           ← 4 ambiances + Web Audio API
WorldReveal             ← Monde Brume : fond + cerf + phrase lettre/lettre
EspaceVrai              ← Flux SVG de présences anonymes
```

## Données statiques

```js
const RITUAL_COLORS = [8 items: { hex, label }]
const RITUAL_TEXTURES = ['lourd','léger','rugueux','doux','chaud','froid']
const RITUAL_SOUNDS = ['pluie','vent','feu','silence']

const WORLDS = {
  brume: {
    palette: ['#0d1b2a','#1b2d4f','#2e4a7a'],
    animal: 'cerf',
    animationSpeed: 'slow',
    phrases: [6 phrases qui observent sans diagnostiquer]
  }
}
```

## Audio (Web Audio API)

```js
function startAmbience(type, volume = 0.08) {
  // type: 'pluie' = highpass 2000Hz
  // type: 'vent'  = bandpass 400Hz Q=0.5
  // type: 'feu'   = lowpass 300Hz
  // type: 'silence' = () => {} (no-op)
  // Retourne une fonction stop()
}
```

## Commandes

```bash
npm run dev      # http://localhost:5173
npm run build    # Build Vite
npm run preview  # Preview du build
```

## Pièges connus

- Ne jamais refactoriser en multi-fichiers sans accord Will
- Tailwind via CDN = pas de purge automatique, classes arbitraires OK (`text-white/12`)
- Web Audio API : penser à fermer le contexte audio sur unmount (stopRef pattern)
- `useRef(generateFakeFlux(...)).current` pour stabiliser le flux entre renders
- `Fade key={step}` dans RitualFlow pour re-monter le composant à chaque step
- Google Fonts Sora+Inter importé dans index.html, déclaré dans Tailwind config CDN

## Git

```
main              ← branche principale
feat/<scope>      ← nouvelles features
fix/<scope>       ← corrections
chore/<scope>     ← maintenance
claude/<task>     ← travail Claude autonome
```

Commits : conventional commits (`feat:`, `fix:`, `chore:`, `style:`, `refactor:`)
