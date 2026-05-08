# NÉYA — Animaux-esprits · Quiz · UX · Boutique ÇA VA?

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer le cerf générique par 4 animaux-esprits adaptés à chaque archétype, enrichir le quiz avec un feedback coloré, améliorer la lisibilité de l'app, et ajouter un onglet Boutique ÇA VA?.

**Architecture:** Single-file React (`src/App.jsx`, 1591 lignes). Toutes les modifications se font dans ce fichier. Aucun nouveau fichier. L'ordre des tâches est conçu pour éviter les conflits : on ajoute d'abord les nouveaux composants, puis on modifie les existants.

**Tech Stack:** React 18 + Vite 5 + Tailwind CDN. Pas de tests unitaires (MVP). Vérification visuelle via `npm run dev` → http://localhost:5173.

---

## Fichiers modifiés

- **Modify:** `src/App.jsx` — toutes les 4 tâches

---

## Task 1 : Composants SpiritAnimal (4 animaux SVG inline)

**But :** Remplacer le cerf universel par 4 animaux-esprits distincts selon l'archétype.

**Sections touchées dans App.jsx :**
- Après `// ─── GRAIN FILTER ───` (~ligne 510) : ajouter les composants SVG
- `TransitionScreen` (~ligne 914) : remplacer `<img src={...cerf.svg}>`
- `PatronusReveal` (~ligne 1031) : remplacer `<img src={...cerf.svg}>`
- `HomeScreen` (~ligne 1299) : remplacer `<img src={...cerf.svg}>`
- `App useEffect` (~ligne 1548) : retirer `cerf.svg` du preload

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1 : Ajouter le composant SpiritAnimal après GrainFilter (~ligne 525)**

Insérer ce bloc complet juste après la fermeture de `function GrainFilter()` :

```jsx
// ─── SPIRIT ANIMALS ───────────────────────────────────────────────────────────

function PhoenixSpirit({ size = 120, color = '#f59e0b', style: s }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" style={s}>
      {/* Corps central */}
      <ellipse cx="60" cy="68" rx="10" ry="16" fill={color} opacity="0.92" />
      {/* Aile gauche */}
      <path d="M50 70 C30 55 8 72 4 56 C12 44 34 52 50 62Z" fill={color} opacity="0.85" />
      <path d="M50 72 C28 68 6 82 2 70 C10 58 32 64 50 68Z" fill={color} opacity="0.55" />
      {/* Aile droite */}
      <path d="M70 70 C90 55 112 72 116 56 C108 44 86 52 70 62Z" fill={color} opacity="0.85" />
      <path d="M70 72 C92 68 114 82 118 70 C110 58 88 64 70 68Z" fill={color} opacity="0.55" />
      {/* Queue en flammes */}
      <path d="M55 84 C50 100 44 110 48 118 C54 106 58 96 60 86Z" fill={color} opacity="0.70" />
      <path d="M60 84 C58 102 56 114 60 120 C64 114 62 102 60 86Z" fill={color} opacity="0.90" />
      <path d="M65 84 C70 100 76 110 72 118 C66 106 62 96 60 86Z" fill={color} opacity="0.70" />
      {/* Tête */}
      <ellipse cx="60" cy="50" rx="8" ry="10" fill={color} opacity="0.96" />
      {/* Crête */}
      <path d="M56 42 C52 28 48 18 54 8 C58 20 58 32 60 40Z" fill={color} opacity="0.80" />
      <path d="M60 40 C60 24 62 12 60 2 C62 14 64 28 60 40Z" fill={color} opacity="0.95" />
      <path d="M64 42 C68 28 72 18 66 8 C62 20 62 32 60 40Z" fill={color} opacity="0.80" />
      {/* Lueur centrale */}
      <ellipse cx="60" cy="60" rx="18" ry="22" fill="white" opacity="0.08" />
    </svg>
  )
}

function WolfSpirit({ size = 120, color = '#6366f1', style: s }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" style={s}>
      {/* Corps */}
      <ellipse cx="60" cy="80" rx="24" ry="28" fill={color} opacity="0.18" />
      {/* Tête */}
      <path d="M38 62 C38 40 82 40 82 62 C82 78 72 88 60 88 C48 88 38 78 38 62Z" fill={color} opacity="0.82" />
      {/* Oreilles */}
      <path d="M44 52 C40 34 30 26 34 18 C42 28 46 42 48 52Z" fill={color} opacity="0.90" />
      <path d="M76 52 C80 34 90 26 86 18 C78 28 74 42 72 52Z" fill={color} opacity="0.90" />
      {/* Inner ears */}
      <path d="M45 50 C42 36 34 30 37 22 C43 32 46 43 48 50Z" fill="white" opacity="0.10" />
      <path d="M75 50 C78 36 86 30 83 22 C77 32 74 43 72 50Z" fill="white" opacity="0.10" />
      {/* Museau */}
      <ellipse cx="60" cy="74" rx="12" ry="8" fill={color} opacity="0.60" />
      <ellipse cx="60" cy="72" rx="5" ry="3" fill={color} opacity="0.90" />
      {/* Yeux — deux points lumineux */}
      <ellipse cx="50" cy="60" rx="4" ry="4.5" fill="white" opacity="0.92" />
      <ellipse cx="70" cy="60" rx="4" ry="4.5" fill="white" opacity="0.92" />
      <ellipse cx="51" cy="60" rx="2" ry="2.5" fill={color} opacity="0.20" />
      <ellipse cx="71" cy="60" rx="2" ry="2.5" fill={color} opacity="0.20" />
      {/* Queue */}
      <path d="M84 82 C100 72 114 78 116 88 C104 94 92 88 82 84Z" fill={color} opacity="0.60" />
      {/* Pattes avant */}
      <rect x="46" y="88" width="10" height="22" rx="5" fill={color} opacity="0.55" />
      <rect x="64" y="88" width="10" height="22" rx="5" fill={color} opacity="0.55" />
    </svg>
  )
}

function BearSpirit({ size = 120, color = '#ec4899', style: s }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" style={s}>
      {/* Corps massif */}
      <ellipse cx="60" cy="80" rx="32" ry="30" fill={color} opacity="0.75" />
      {/* Tête */}
      <ellipse cx="60" cy="52" rx="26" ry="24" fill={color} opacity="0.88" />
      {/* Oreilles rondes */}
      <circle cx="38" cy="34" r="11" fill={color} opacity="0.90" />
      <circle cx="82" cy="34" r="11" fill={color} opacity="0.90" />
      <circle cx="38" cy="34" r="7" fill="white" opacity="0.08" />
      <circle cx="82" cy="34" r="7" fill="white" opacity="0.08" />
      {/* Museau */}
      <ellipse cx="60" cy="60" rx="13" ry="9" fill={color} opacity="0.55" />
      <ellipse cx="60" cy="59" rx="6" ry="4" fill={color} opacity="0.85" />
      {/* Nez */}
      <ellipse cx="60" cy="56" rx="3.5" ry="2.5" fill="white" opacity="0.30" />
      {/* Yeux */}
      <circle cx="50" cy="48" r="5" fill="white" opacity="0.90" />
      <circle cx="70" cy="48" r="5" fill="white" opacity="0.90" />
      <circle cx="51" cy="48" r="2.5" fill={color} opacity="0.25" />
      <circle cx="71" cy="48" r="2.5" fill={color} opacity="0.25" />
      {/* Lueur intérieure */}
      <ellipse cx="60" cy="60" rx="22" ry="20" fill="white" opacity="0.05" />
      {/* Pattes */}
      <ellipse cx="36" cy="104" rx="12" ry="10" fill={color} opacity="0.60" />
      <ellipse cx="84" cy="104" rx="12" ry="10" fill={color} opacity="0.60" />
    </svg>
  )
}

function DeerSpirit({ size = 120, color = '#14b8a6', style: s }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" style={s}>
      {/* Corps svelte */}
      <ellipse cx="60" cy="82" rx="18" ry="26" fill={color} opacity="0.70" />
      {/* Cou */}
      <rect x="54" y="56" width="12" height="22" rx="6" fill={color} opacity="0.80" />
      {/* Tête */}
      <ellipse cx="60" cy="50" rx="14" ry="16" fill={color} opacity="0.88" />
      {/* Bois gauche */}
      <path d="M48 42 C44 28 36 20 30 10 M44 36 C38 26 28 22 22 14 M44 36 C42 24 38 14 36 4" stroke={color} strokeWidth="2.5" strokeLinecap="round" opacity="0.80" fill="none"/>
      {/* Bois droit */}
      <path d="M72 42 C76 28 84 20 90 10 M76 36 C82 26 92 22 98 14 M76 36 C78 24 82 14 84 4" stroke={color} strokeWidth="2.5" strokeLinecap="round" opacity="0.80" fill="none"/>
      {/* Museau */}
      <ellipse cx="60" cy="58" rx="8" ry="6" fill={color} opacity="0.55" />
      <ellipse cx="60" cy="56" rx="3.5" ry="2.5" fill="white" opacity="0.20" />
      {/* Yeux */}
      <ellipse cx="52" cy="47" rx="4" ry="4.5" fill="white" opacity="0.90" />
      <ellipse cx="68" cy="47" rx="4" ry="4.5" fill="white" opacity="0.90" />
      {/* Pattes */}
      <rect x="50" y="106" width="7" height="14" rx="3.5" fill={color} opacity="0.55" />
      <rect x="63" y="106" width="7" height="14" rx="3.5" fill={color} opacity="0.55" />
    </svg>
  )
}

function SpiritAnimal({ archetype, size = 120, style: s }) {
  const arch = ARCHETYPES[archetype] || ARCHETYPES.presence
  const props = { size, color: arch.color, style: s }
  if (archetype === 'resilience') return <PhoenixSpirit {...props} />
  if (archetype === 'sagesse')    return <WolfSpirit    {...props} />
  if (archetype === 'lumiere')    return <BearSpirit    {...props} />
  return <DeerSpirit {...props} />
}
```

- [ ] **Step 2 : Remplacer cerf.svg dans TransitionScreen (~ligne 914)**

Remplacer :
```jsx
<img src={`${B}cerf.svg`} style={{ width: 40, height: 40, opacity: 0.78, animation: 'cerfdrift 10s ease-in-out infinite', position: 'relative' }} alt="" />
```
Par :
```jsx
<SpiritAnimal archetype="presence" size={40} style={{ opacity: 0.78, animation: 'cerfdrift 10s ease-in-out infinite', position: 'relative' }} />
```

- [ ] **Step 3 : Remplacer cerf.svg dans PatronusReveal (~ligne 1031-1040)**

Remplacer le bloc `<img>` dans PatronusReveal :
```jsx
<img
  src={`${B}cerf.svg`}
  alt=""
  style={{
    width: 210, height: 210,
    display: 'block',
    filter: `drop-shadow(0 0 28px ${arch.color}) drop-shadow(0 0 55px rgba(255,255,255,0.8)) drop-shadow(0 0 90px ${arch.color}99)`,
    animation: 'cerfdrift 11s ease-in-out infinite 2.5s',
  }}
/>
```
Par :
```jsx
<SpiritAnimal
  archetype={arch === ARCHETYPES.resilience ? 'resilience' : arch === ARCHETYPES.sagesse ? 'sagesse' : arch === ARCHETYPES.lumiere ? 'lumiere' : 'presence'}
  size={210}
  style={{
    display: 'block',
    filter: `drop-shadow(0 0 28px ${arch.color}) drop-shadow(0 0 55px rgba(255,255,255,0.8)) drop-shadow(0 0 90px ${arch.color}99)`,
    animation: 'cerfdrift 11s ease-in-out infinite 2.5s',
  }}
/>
```

Note : `arch` dans PatronusReveal est la valeur de `ARCHETYPES[archetypeKey]`. Pour retrouver la clé, ajouter `archetypeKey` comme prop à `PatronusReveal` et passer `archetypeKey` au lieu de comparer les objets.

Version correcte — modifier la signature de PatronusReveal :
```jsx
function PatronusReveal({ arch, archetypeKey, onDone }) {
```
Et dans ResultScreen phase 0, passer `archetypeKey` :
```jsx
<PatronusReveal arch={arch} archetypeKey={archetypeKey} onDone={() => { ... }} />
```
Puis dans PatronusReveal, utiliser directement :
```jsx
<SpiritAnimal
  archetype={archetypeKey}
  size={210}
  style={{
    display: 'block',
    filter: `drop-shadow(0 0 28px ${arch.color}) drop-shadow(0 0 55px rgba(255,255,255,0.8)) drop-shadow(0 0 90px ${arch.color}99)`,
    animation: 'cerfdrift 11s ease-in-out infinite 2.5s',
  }}
/>
```

- [ ] **Step 4 : Remplacer cerf.svg dans HomeScreen (~ligne 1299-1303)**

Remplacer :
```jsx
<img
  src={`${B}cerf.svg`}
  alt=""
  style={{ width: 74, height: 74, opacity: 0.80, filter: `drop-shadow(0 0 16px ${arch.shadow}) drop-shadow(0 0 32px ${arch.color}44)`, animation: 'cerfdrift 10s ease-in-out infinite', position: 'relative', zIndex: 1 }}
/>
```
Par :
```jsx
<SpiritAnimal
  archetype={archetypeKey}
  size={74}
  style={{ opacity: 0.80, filter: `drop-shadow(0 0 16px ${arch.shadow}) drop-shadow(0 0 32px ${arch.color}44)`, animation: 'cerfdrift 10s ease-in-out infinite', position: 'relative', zIndex: 1 }}
/>
```

- [ ] **Step 5 : Retirer cerf.svg du preload dans App useEffect (~ligne 1548)**

Remplacer :
```jsx
const assets = ['bg-onboarding.png','bg-cosmos.png','bg-cosmos-alt.png','bg-feu.png','bg-eau.png','bg-foret.png','bg-brume.png','bg-vide.png','bg-vrai.png','cerf.svg']
```
Par :
```jsx
const assets = ['bg-onboarding.png','bg-cosmos.png','bg-cosmos-alt.png','bg-feu.png','bg-eau.png','bg-foret.png','bg-brume.png','bg-vide.png','bg-vrai.png']
```

- [ ] **Step 6 : Vérification visuelle**

```bash
cd "/Users/williammorel/NÉYA" && npm run dev
```
Ouvrir http://localhost:5173. Faire le quiz complet. Vérifier :
- TransitionScreen : affiche un animal (peu importe lequel, générique)
- PatronusReveal : affiche le bon animal selon le résultat
- HomeScreen : affiche le bon animal dans le ring central

- [ ] **Step 7 : Commit**

```bash
cd "/Users/williammorel/NÉYA"
git add src/App.jsx
git commit -m "feat: add 4 spirit animal SVG components (phoenix, wolf, bear, deer)"
```

---

## Task 2 : Quiz — feedback couleur archétype à la sélection

**But :** Quand l'utilisateur sélectionne une réponse, l'overlay de l'écran se teinte subtilement avec la couleur de l'archétype choisi.

**Section touchée :** `QuizScreen` (~ligne 792-892)

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1 : Ajouter la constante de couleurs par archétype dans QuizScreen**

Dans `QuizScreen`, après la déclaration des états existants (après `const [bgFadeOp, setBgFadeOp] = useState(0)`), ajouter :

```jsx
const ARCHETYPE_TINTS = {
  resilience: 'rgba(245,158,11,0.10)',
  presence:   'rgba(20,184,166,0.10)',
  sagesse:    'rgba(99,102,241,0.10)',
  lumiere:    'rgba(236,72,153,0.10)',
}
```

- [ ] **Step 2 : Ajouter l'overlay teinté dans le JSX de QuizScreen**

Juste après la ligne `<GrainFilter />` dans le return de QuizScreen (~ligne 857), ajouter :

```jsx
{/* Archetype tint overlay */}
<div style={{
  position: 'absolute',
  inset: 0,
  background: selected ? ARCHETYPE_TINTS[selected] : 'transparent',
  transition: 'background 0.5s ease',
  pointerEvents: 'none',
  zIndex: 2,
}} />
```

- [ ] **Step 3 : Vérification visuelle**

Ouvrir http://localhost:5173, lancer le quiz. Sélectionner une réponse et vérifier qu'un léger tint coloré apparaît sur l'écran, disparaît au changement de question.

- [ ] **Step 4 : Commit**

```bash
cd "/Users/williammorel/NÉYA"
git add src/App.jsx
git commit -m "feat: add archetype color tint feedback on quiz answer selection"
```

---

## Task 3 : UX — lisibilité de l'app principale

**But :** Améliorer le contraste et la lisibilité dans HomeScreen, RoutinesScreen, QuetesScreen.

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1 : HomeScreen — améliorer contraste des cards**

Dans `HomeScreen`, trouver la card "Intention du jour" (~ligne 1318) :
```jsx
<div style={{ background: `linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(${arch.rgb},0.03) 100%)`, border: `1px solid ${arch.color}1a`, borderRadius: 14, padding: '20px 18px', minHeight: 92 }}>
```
Remplacer par :
```jsx
<div style={{ background: `linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(${arch.rgb},0.06) 100%)`, border: `1px solid ${arch.color}33`, borderRadius: 14, padding: '20px 18px', minHeight: 92, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
```

- [ ] **Step 2 : HomeScreen — intention fontSize**

Trouver le texte de l'intention (~ligne 1321) :
```jsx
<div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 15.5, color: 'rgba(255,255,255,0.86)', lineHeight: 1.68, fontStyle: 'italic' }}>
```
Remplacer par :
```jsx
<div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 17, color: 'rgba(255,255,255,0.92)', lineHeight: 1.72, fontStyle: 'italic' }}>
```

- [ ] **Step 3 : HomeScreen — cards Routines/Quêtes du jour**

Trouver les mini-cards de progression (~ligne 1348) :
```jsx
<div key={i} style={{ flex: 1, background: s.count > 0 ? `linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(${arch.rgb},0.05) 100%)` : 'rgba(255,255,255,0.05)', border: `1px solid ${s.count > 0 ? arch.color + '44' : 'rgba(255,255,255,0.07)'}`, borderRadius: 12, padding: '16px 14px',
```
Remplacer les deux valeurs de background :
```jsx
<div key={i} style={{ flex: 1, background: s.count > 0 ? `linear-gradient(135deg, rgba(255,255,255,0.09) 0%, rgba(${arch.rgb},0.08) 100%)` : 'rgba(255,255,255,0.07)', border: `1px solid ${s.count > 0 ? arch.color + '66' : 'rgba(255,255,255,0.12)'}`, borderRadius: 12, padding: '16px 14px',
```

- [ ] **Step 4 : RoutinesScreen — titre et description des routines**

Dans `RoutinesScreen`, trouver le titre de routine (~ligne 1396) :
```jsx
<p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 15, color: done ? arch.color : 'white', margin: 0, transition: 'color 0.3s ease' }}>{r.title}</p>
```
Remplacer `fontSize: 15` par `fontSize: 16`.

Trouver la description de routine (~ligne 1399) :
```jsx
<p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 13.5, color: done ? 'rgba(255,255,255,0.36)' : 'rgba(255,255,255,0.6)',
```
Remplacer `fontSize: 13.5` par `fontSize: 14.5` et `'rgba(255,255,255,0.6)'` par `'rgba(255,255,255,0.75)'`.

- [ ] **Step 5 : QuetesScreen — titre et description des quêtes**

Dans `QuetesScreen`, trouver le titre de quête (~ligne 1440) :
```jsx
<p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 15.5, color: done ? arch.color : locked ? 'rgba(255,255,255,0.26)' : 'white',
```
Remplacer `fontSize: 15.5` par `fontSize: 16.5`.

Trouver la description de quête (~ligne 1444) :
```jsx
<p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 13.5, color: locked ? 'rgba(255,255,255,0.18)' : done ? 'rgba(255,255,255,0.36)' : 'rgba(255,255,255,0.62)',
```
Remplacer `fontSize: 13.5` par `fontSize: 14.5` et `'rgba(255,255,255,0.62)'` par `'rgba(255,255,255,0.78)'`.

- [ ] **Step 6 : Vérification visuelle**

Ouvrir http://localhost:5173 (depuis le main app si déjà un profil en localStorage, sinon faire le quiz). Vérifier que les textes sont plus lisibles, les cards plus contrastées.

- [ ] **Step 7 : Commit**

```bash
cd "/Users/williammorel/NÉYA"
git add src/App.jsx
git commit -m "style: improve readability in HomeScreen, Routines, Quetes"
```

---

## Task 4 : Onglet Boutique ÇA VA?

**But :** Ajouter un 4ème onglet "Boutique" avec des cards éditoriales de collections ÇA VA? liées aux archétypes.

**Sections touchées :**
- Après `QuetesScreen` (~ligne 1464) : ajouter `BoutiqueScreen`
- `BottomNav` (~ligne 1224) : ajouter 4ème tab
- `MainApp` (~ligne 1468) : ajouter tab boutique

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1 : Ajouter NavIconBoutique dans les icônes de nav (~ligne 1215)**

Après `function NavIconQuetes(...)`, ajouter :
```jsx
function NavIconBoutique({ active, color }) {
  const c = active ? color : 'rgba(255,255,255,0.26)'
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke={c} strokeWidth="1.4" strokeLinejoin="round" fill={active ? color + '22' : 'none'} />
      <line x1="3" y1="6" x2="21" y2="6" stroke={c} strokeWidth="1.4" />
      <path d="M16 10a4 4 0 01-8 0" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}
```

- [ ] **Step 2 : Mettre à jour BottomNav pour inclure le 4ème tab (~ligne 1224)**

Dans `BottomNav`, remplacer le tableau `tabs` :
```jsx
const tabs = [
  { key: 'home', label: 'Accueil', Icon: NavIconHome },
  { key: 'routines', label: 'Routines', Icon: NavIconRoutines },
  { key: 'quetes', label: 'Quêtes', Icon: NavIconQuetes },
]
```
Par :
```jsx
const tabs = [
  { key: 'home',     label: 'Accueil',  Icon: NavIconHome },
  { key: 'routines', label: 'Routines', Icon: NavIconRoutines },
  { key: 'quetes',   label: 'Quêtes',   Icon: NavIconQuetes },
  { key: 'boutique', label: 'Boutique', Icon: NavIconBoutique },
]
```

- [ ] **Step 3 : Ajouter BoutiqueScreen après QuetesScreen (~ligne 1464)**

Insérer ce composant complet juste avant `// ─── MAIN APP ───` :

```jsx
// ─── BOUTIQUE SCREEN ──────────────────────────────────────────────────────────

const CA_VA_COLLECTIONS = [
  {
    key: 'resilience',
    name: 'Collection Braise',
    subtitle: 'Pour les Porteurs de Feu',
    desc: 'Pièces qui incarnent la force tranquille et la transformation intérieure.',
    bg: 'bg-feu.png',
    color: '#f59e0b',
    rgb: '245,158,11',
    tags: ['Force', 'Courage', 'Mouvement'],
  },
  {
    key: 'presence',
    name: 'Collection Marée',
    subtitle: 'Pour les Ancreurs de Présence',
    desc: 'Des silhouettes fluides qui épousent l\'instant et cultivent la paix intérieure.',
    bg: 'bg-eau.png',
    color: '#14b8a6',
    rgb: '20,184,166',
    tags: ['Douceur', 'Calme', 'Harmonie'],
  },
  {
    key: 'sagesse',
    name: 'Collection Brume',
    subtitle: 'Pour les Éveilleurs de Sens',
    desc: 'Des pièces habitées d\'une profondeur silencieuse. Celles qui ont quelque chose à dire.',
    bg: 'bg-brume.png',
    color: '#6366f1',
    rgb: '99,102,241',
    tags: ['Profondeur', 'Intuition', 'Mystère'],
  },
  {
    key: 'lumiere',
    name: 'Collection Forêt',
    subtitle: 'Pour les Créateurs de Lumière',
    desc: 'De l\'éclat, de la joie, de la vie. Des vêtements qui rayonnent autant que toi.',
    bg: 'bg-foret.png',
    color: '#ec4899',
    rgb: '236,72,153',
    tags: ['Joie', 'Créativité', 'Lumière'],
  },
]

function BoutiqueScreen({ archetypeKey }) {
  const [vis, setVis] = useState(false)
  const [expandedKey, setExpandedKey] = useState(null)
  useEffect(() => { const t = setTimeout(() => setVis(true), 80); return () => clearTimeout(t) }, [])

  const myCollection = CA_VA_COLLECTIONS.find(c => c.key === archetypeKey)
  const otherCollections = CA_VA_COLLECTIONS.filter(c => c.key !== archetypeKey)

  const handleDiscover = (collectionName) => {
    haptic([10, 30, 10])
    window.open('https://cava-brand.com', '_blank')
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '52px 22px 100px', display: 'flex', flexDirection: 'column', gap: 20, opacity: vis ? 1 : 0, transition: 'opacity 0.6s ease' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 4 }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.32em', margin: '0 0 10px', textTransform: 'uppercase' }}>LA MARQUE</p>
        <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 28, color: 'white', margin: '0 0 6px', letterSpacing: '0.22em', textShadow: '0 2px 30px rgba(0,0,0,0.5)' }}>ÇA VA?</h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 13, color: 'rgba(255,255,255,0.38)', margin: 0, lineHeight: 1.65 }}>
          Des vêtements qui portent<br />ce que les mots ne disent pas.
        </p>
      </div>

      {/* Ta collection — mise en avant */}
      {myCollection && (
        <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 18, border: `1px solid ${myCollection.color}55` }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${B}${myCollection.bg})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, rgba(5,8,16,0.30) 0%, rgba(5,8,16,0.82) 100%)` }} />
          <div style={{ position: 'relative', zIndex: 1, padding: '22px 20px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, background: myCollection.color, color: '#050810', borderRadius: 100, padding: '3px 10px', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Ta collection</span>
            </div>
            <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 24, color: 'white', margin: 0, lineHeight: 1.15 }}>{myCollection.name}</h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: myCollection.color, letterSpacing: '0.16em', margin: 0, textTransform: 'uppercase' }}>{myCollection.subtitle}</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 14, color: 'rgba(255,255,255,0.78)', margin: 0, lineHeight: 1.65 }}>{myCollection.desc}</p>
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
              {myCollection.tags.map(tag => (
                <span key={tag} style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: myCollection.color, border: `1px solid ${myCollection.color}44`, borderRadius: 100, padding: '3px 10px', letterSpacing: '0.08em' }}>{tag}</span>
              ))}
            </div>
            <button
              onClick={() => handleDiscover(myCollection.name)}
              style={{ marginTop: 4, width: '100%', padding: '15px 0', background: myCollection.color, border: 'none', borderRadius: 100, cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: 12, fontWeight: 500, letterSpacing: '0.22em', color: '#050810', textTransform: 'uppercase', boxShadow: `0 4px 24px ${myCollection.color}55` }}
            >
              Découvrir la collection
            </button>
          </div>
        </div>
      )}

      {/* Séparateur */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 9.5, color: 'rgba(255,255,255,0.22)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Autres collections</span>
        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
      </div>

      {/* Autres collections */}
      {otherCollections.map(col => (
        <div
          key={col.key}
          onClick={() => setExpandedKey(expandedKey === col.key ? null : col.key)}
          style={{ position: 'relative', overflow: 'hidden', borderRadius: 14, border: `1px solid rgba(255,255,255,0.09)`, cursor: 'pointer' }}
        >
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${B}${col.bg})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.35 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(5,8,16,0.65)' }} />
          <div style={{ position: 'relative', zIndex: 1, padding: '18px 18px', display: 'flex', flexDirection: 'column', gap: expandedKey === col.key ? 12 : 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300, fontSize: 18, color: 'white', margin: 0 }}>{col.name}</h3>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, color: col.color, letterSpacing: '0.08em' }}>{expandedKey === col.key ? '▲' : '▼'}</span>
            </div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: col.color, letterSpacing: '0.14em', margin: 0, textTransform: 'uppercase' }}>{col.subtitle}</p>
            {expandedKey === col.key && (
              <>
                <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 13.5, color: 'rgba(255,255,255,0.70)', margin: 0, lineHeight: 1.65 }}>{col.desc}</p>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDiscover(col.name) }}
                  style={{ width: '100%', padding: '13px 0', background: `rgba(${col.rgb},0.18)`, border: `1px solid ${col.color}55`, borderRadius: 100, cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: 11.5, fontWeight: 400, letterSpacing: '0.2em', color: col.color, textTransform: 'uppercase' }}
                >
                  Découvrir
                </button>
              </>
            )}
          </div>
        </div>
      ))}

      {/* Footer */}
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.16)', textAlign: 'center', lineHeight: 1.7, margin: '8px 0 0' }}>
        ÇA VA? × NÉYA<br />
        <span style={{ fontSize: 10, letterSpacing: '0.06em' }}>Chaque vêtement porte une intention.</span>
      </p>
    </div>
  )
}
```

- [ ] **Step 4 : Mettre à jour MainApp pour gérer le tab boutique (~ligne 1499-1501)**

Dans `MainApp`, trouver le bloc de rendu des tabs :
```jsx
{tab === 'home' && <HomeScreen archetypeKey={archetypeKey} routinesDone={routinesDone} quetesDone={quetesDone} onRestart={onRestart} onOpenVrai={() => setVraiOpen(true)} savedAt={savedAt} />}
{tab === 'routines' && <RoutinesScreen archetypeKey={archetypeKey} completed={routinesDone} onToggle={toggleRoutine} />}
{tab === 'quetes' && <QuetesScreen archetypeKey={archetypeKey} completed={quetesDone} onComplete={completeQuete} />}
```
Ajouter après le dernier :
```jsx
{tab === 'boutique' && <BoutiqueScreen archetypeKey={archetypeKey} />}
```

- [ ] **Step 5 : Vérification visuelle**

```bash
npm run dev
```
Ouvrir http://localhost:5173. Naviguer jusqu'au main app. Vérifier :
- 4 tabs visibles dans la bottom nav (Accueil, Routines, Quêtes, Boutique)
- Onglet Boutique s'affiche avec la collection de l'archétype en avant
- Les 3 autres collections sont en mode collapsed, s'expandent au tap
- Bouton "Découvrir" visible sur la collection de l'archétype

- [ ] **Step 6 : Commit**

```bash
cd "/Users/williammorel/NÉYA"
git add src/App.jsx
git commit -m "feat: add CA VA? boutique tab with archetype-linked collections"
```

---

## Task 5 : Déploiement prod

- [ ] **Step 1 : Build de vérification**

```bash
cd "/Users/williammorel/NÉYA" && npm run build 2>&1
```
Expected : `✓ built in ~2s`, aucune erreur.

- [ ] **Step 2 : Déploiement production**

```bash
cd "/Users/williammorel/NÉYA" && vercel --prod 2>&1
```
Expected : `Production: https://neya-kappa.vercel.app`

- [ ] **Step 3 : Mettre à jour ROBOT.md**

Dans `ROBOT.md`, section `## 9. État actuel`, mettre à jour la date et les features actives pour refléter les 4 nouvelles features.
