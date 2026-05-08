# Animations & Transitions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade all animations and transitions in NÉYA — animals float organically, screen transitions carry emotion, interactions give tactile feedback, and each world pulses with its own rhythm.

**Architecture:** Single-file discipline — all changes are in `src/App.jsx`. New CSS keyframes injected in the existing `useEffect` style block (lines 1769-1789). No new files.

**Tech Stack:** React 18 inline styles, CSS keyframes via `document.createElement('style')`, existing `useEffect` style injection pattern.

---

### Task A: Animal float — `animalfloat` + `animalbreathe` keyframes

Replace the mechanical `cerfdrift` (simple translateY) with two organic keyframes on all 3 `SpiritAnimal` usages.

**Files:**
- Modify: `src/App.jsx` (keyframes block ~line 1774, usages at lines 1023, 1146, 1422)

- [ ] **Step 1: Add the two new keyframes inside the style.textContent string**

In `src/App.jsx` around line 1774, the style.textContent has `@keyframes cerfdrift`. Replace the `cerfdrift` line with these three lines (keep cerfdrift for safety — we'll remove it after):

```js
// Inside style.textContent = ` ... ` block, REPLACE this line:
      @keyframes cerfdrift    { 0%,100%{transform:translateY(0)}               50%{transform:translateY(-6px)} }
// WITH these two new lines:
      @keyframes animalfloat  { 0%,100%{transform:translateY(0) scale(1) translateX(0)}  50%{transform:translateY(-7px) scale(1.028) translateX(3px)} }
      @keyframes animalbreathe{ 0%,100%{filter:brightness(1)}                            50%{filter:brightness(1.10)} }
```

- [ ] **Step 2: Update TransitionScreen usage (line ~1023)**

Find and replace the SpiritAnimal animation at line 1023:

```js
// FIND:
<SpiritAnimal archetype="presence" size={40} style={{ opacity: 0.78, animation: 'cerfdrift 10s ease-in-out infinite', position: 'relative' }} />
// REPLACE WITH:
<SpiritAnimal archetype="presence" size={40} style={{ opacity: 0.78, animation: 'animalfloat 18s ease-in-out infinite, animalbreathe 22s ease-in-out infinite', position: 'relative' }} />
```

- [ ] **Step 3: Update PatronusReveal usage (line ~1146)**

```js
// FIND:
              animation: 'cerfdrift 11s ease-in-out infinite 2.5s',
// REPLACE WITH:
              animation: 'animalfloat 18s ease-in-out infinite 2.5s, animalbreathe 22s ease-in-out infinite 2.5s',
```

- [ ] **Step 4: Update HomeScreen usage (line ~1422)**

```js
// FIND:
style={{ opacity: 0.80, filter: `drop-shadow(0 0 16px ${arch.shadow}) drop-shadow(0 0 32px ${arch.color}44)`, animation: 'cerfdrift 10s ease-in-out infinite', position: 'relative', zIndex: 1 }}
// REPLACE WITH:
style={{ opacity: 0.80, filter: `drop-shadow(0 0 16px ${arch.shadow}) drop-shadow(0 0 32px ${arch.color}44)`, animation: 'animalfloat 18s ease-in-out infinite, animalbreathe 22s ease-in-out infinite', position: 'relative', zIndex: 1 }}
```

Note: `animalbreathe` uses `filter: brightness()`. The HomeScreen animal already has a `filter` style property via the parent's `drop-shadow`. To avoid conflict, the `animalbreathe` keyframe uses `filter` alone. The drop-shadow is on the style attribute, while animalbreathe's brightness will stack via animation — this is fine because animation `filter` overrides the inline `filter` when both are set. Instead, move the drop-shadow INTO the keyframe's initial state, OR simply skip `animalbreathe` on HomeScreen (it's in a small ring context). On HomeScreen, just use `animalfloat`. On PatronusReveal (large 210px animal), both apply cleanly since there's no inline filter style.

Revised HomeScreen replacement (animalfloat only, no animalbreathe to avoid filter conflict):
```js
style={{ opacity: 0.80, filter: `drop-shadow(0 0 16px ${arch.shadow}) drop-shadow(0 0 32px ${arch.color}44)`, animation: 'animalfloat 18s ease-in-out infinite', position: 'relative', zIndex: 1 }}
```

- [ ] **Step 5: Verify build passes**

```bash
cd /Users/williammorel/NÉYA && npm run build 2>&1 | tail -20
```

Expected: No errors, build output shows `dist/assets/index-*.js`

- [ ] **Step 6: Commit**

```bash
cd /Users/williammorel/NÉYA && git add src/App.jsx && git commit -m "feat: organic animal float — animalfloat+animalbreathe replace cerfdrift"
```

---

### Task B: Screen & tab transitions

Three sub-changes: (1) colored blackout, (2) `tabslideIn` for tab content, (3) ResultScreen phase scale.

**Files:**
- Modify: `src/App.jsx` (keyframes ~line 1789, blackout div ~line 1835, tab wrapper ~line 1744, ResultScreen wrapper ~line 1224)

- [ ] **Step 1: Add `tabslideIn` keyframe to the style block**

After the last existing keyframe (`splashmote`) inside the style.textContent string, add:

```js
      @keyframes tabslideIn   { 0%{transform:translateX(10px);opacity:0}        100%{transform:translateX(0);opacity:1} }
```

- [ ] **Step 2: Apply `tabslideIn` to the tab content wrapper in MainApp (~line 1744)**

```js
// FIND:
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', opacity: tabVis ? 1 : 0, transition: 'opacity 0.19s ease', overflow: 'hidden' }}>
// REPLACE WITH:
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', opacity: tabVis ? 1 : 0, animation: tabVis ? 'tabslideIn 0.22s ease-out' : 'none', transition: 'opacity 0.19s ease', overflow: 'hidden' }}>
```

- [ ] **Step 3: Add ResultScreen phase scale transform (~line 1224)**

```js
// FIND:
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, width: '100%', textAlign: 'center', opacity: phaseVis ? 1 : 0, transition: 'opacity 0.32s ease' }}>
// REPLACE WITH:
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, width: '100%', textAlign: 'center', opacity: phaseVis ? 1 : 0, transform: phaseVis ? 'scale(1)' : 'scale(0.97)', transition: 'opacity 0.32s ease, transform 0.32s ease' }}>
```

- [ ] **Step 4: Add colored archetype blackout overlay**

The `go()` function at ~line 1805 triggers blackout. The App component already has `archetype` state. Add a second overlay div right after the existing blackout div at ~line 1835.

The existing blackout div ends the JSX return at line 1835. Add a sibling div:

```js
// FIND (the blackout div ~line 1835):
      <div style={{ position: 'fixed', inset: 0, background: '#050810', zIndex: 9999, opacity: blackout ? 1 : 0, transition: blackout ? 'opacity 0.36s ease' : 'opacity 0.28s ease', pointerEvents: blackout ? 'all' : 'none' }} />
// REPLACE WITH (two divs):
      <div style={{ position: 'fixed', inset: 0, background: '#050810', zIndex: 9999, opacity: blackout ? 1 : 0, transition: blackout ? 'opacity 0.36s ease' : 'opacity 0.28s ease', pointerEvents: blackout ? 'all' : 'none' }} />
      {archetype && ARCHETYPES[archetype] && (
        <div style={{ position: 'fixed', inset: 0, background: ARCHETYPES[archetype].color, zIndex: 10000, opacity: blackout ? 0.08 : 0, transition: blackout ? 'opacity 0.36s ease' : 'opacity 0.28s ease', pointerEvents: 'none' }} />
      )}
```

- [ ] **Step 5: Verify build**

```bash
cd /Users/williammorel/NÉYA && npm run build 2>&1 | tail -20
```

- [ ] **Step 6: Commit**

```bash
cd /Users/williammorel/NÉYA && git add src/App.jsx && git commit -m "feat: tab slide-in, result scale, colored blackout transitions"
```

---

### Task C: Interactive feedback — quiz ripple, forces spring, boutique stagger

**Files:**
- Modify: `src/App.jsx` (keyframes, forces cards ~line 1234, boutique otherCollections ~line 1682, quiz ripple)

- [ ] **Step 1: Add `forcespring` and `choiceripple` keyframes to style block**

Inside style.textContent, add after `tabslideIn`:

```js
      @keyframes forcespring  { 0%{transform:translateY(20px);opacity:0} 70%{transform:translateY(-4px);opacity:0.8} 100%{transform:translateY(0);opacity:1} }
      @keyframes choiceripple { 0%{transform:scale(0);opacity:0.6}        100%{transform:scale(2.5);opacity:0} }
```

- [ ] **Step 2: Replace forces card transition with forcespring animation (~line 1234)**

```js
// FIND the forces card div style (on line ~1234) — the long one with transition at the end:
opacity: forcesShown > i ? 1 : 0, transform: forcesShown > i ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 0.44s ease, transform 0.44s ease'
// REPLACE WITH:
animation: forcesShown > i ? `forcespring 0.5s ease forwards ${i * 120}ms` : 'none', opacity: forcesShown > i ? 1 : 0
```

The full line 1234 becomes:
```js
                  <div key={i} style={{ background: `radial-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(${arch.rgb},0.04) 100%)`, border: `1px solid ${arch.color}55`, borderRadius: 12, padding: '20px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9, animation: forcesShown > i ? `forcespring 0.5s ease forwards` : 'none', animationDelay: forcesShown > i ? `${i * 120}ms` : '0ms', opacity: forcesShown > i ? 1 : 0 }}>
```

Note: `animation` shorthand doesn't support per-element delay well in JSX with template literals when the keyframe also sets opacity — use separate `animationDelay` style prop.

- [ ] **Step 3: Add quiz ripple state and overlay in QuizScreen**

Find the QuizScreen component. Locate the `[selected, setSelected]` state. Add a ripple state:

```js
// After: const [selected, setSelected] = useState(null)
const [rippleIdx, setRippleIdx] = useState(null)
```

In the onClick handler for quiz choices, add ripple trigger:
```js
// Find the onClick that calls setSelected. It looks like:
onClick={() => { if (selected !== null) return; haptic(8); setSelected(i) }}
// REPLACE WITH:
onClick={() => { if (selected !== null) return; haptic(8); setSelected(i); setRippleIdx(i); setTimeout(() => setRippleIdx(null), 620) }}
```

On each choice button, add a ripple overlay inside the button (after the button's existing children, as a sibling or child):
```js
// Inside the map that renders quiz choices, inside the button/div element:
{rippleIdx === i && (
  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', overflow: 'hidden', borderRadius: 'inherit' }}>
    <div style={{ width: 40, height: 40, borderRadius: '50%', background: ARCHETYPES[QUIZ[currentQ]?.choices[i]?.archetype]?.color || 'rgba(255,255,255,0.4)', animation: 'choiceripple 0.6s ease-out forwards' }} />
  </div>
)}
```

The choice button/div needs `position: 'relative'` to contain the absolute ripple — verify it already has this or add it.

- [ ] **Step 4: Add boutique stagger on otherCollections (~line 1682)**

Find the `otherCollections.map` in BoutiqueScreen at ~line 1682. Add `animation` with stagger:

```js
// FIND the opening div of each collection card inside otherCollections.map — it looks like:
      {otherCollections.map(col => (
        <div key={col.key} style={{ ... }}>
// ADD animation to the outer div style (identify the style object and add):
animation: `tabslideIn 0.3s ease-out both`,
animationDelay: `${otherCollections.indexOf(col) * 80}ms`,
```

Since `col` index isn't passed in the map, refactor the map to use index:
```js
{otherCollections.map((col, colIdx) => (
  <div key={col.key} style={{ ...existingStyles, animation: 'tabslideIn 0.3s ease-out both', animationDelay: `${colIdx * 80}ms` }}>
```

- [ ] **Step 5: Verify build**

```bash
cd /Users/williammorel/NÉYA && npm run build 2>&1 | tail -20
```

- [ ] **Step 6: Commit**

```bash
cd /Users/williammorel/NÉYA && git add src/App.jsx && git commit -m "feat: forcespring cards, quiz ripple feedback, boutique stagger"
```

---

### Task D: Ambient world effects — worldglow + ring shimmer

**Files:**
- Modify: `src/App.jsx` (keyframes, MainApp JSX ~line 1742, HomeScreen PresenceRing area ~line 1413)

- [ ] **Step 1: Add `worldglow` and `ringshimmer` keyframes**

Add to style.textContent:
```js
      @keyframes worldglow    { 0%,100%{opacity:0.5}                             50%{opacity:1} }
      @keyframes ringshimmer  { 0%{transform:rotate(0deg)}                       100%{transform:rotate(360deg)} }
```

- [ ] **Step 2: Add world glow overlay in MainApp**

MainApp has a `BgScreen` wrapper at line ~1742. Inside the outermost div (just after the BgScreen opening and its first child div), add a world-specific glow overlay.

The world period map (in seconds):
```js
const WORLD_GLOW_PERIOD = { 'bg-brume.png': 30, 'bg-feu.png': 8, 'bg-foret.png': 18, 'bg-eau.png': 24, 'bg-cosmos.png': 42, 'bg-vide.png': 60 }
```

Define this constant at the top of the MainApp function body, then add an overlay div inside the BgScreen's inner div at ~line 1743:

```js
// At the top of MainApp function body, after const arch = ARCHETYPES[archetypeKey]:
const WORLD_GLOW_PERIOD = { 'bg-brume.png': 30, 'bg-feu.png': 8, 'bg-foret.png': 18, 'bg-eau.png': 24, 'bg-cosmos.png': 42, 'bg-vide.png': 60 }
const glowPeriod = WORLD_GLOW_PERIOD[arch.bg] || 24

// Inside the JSX, as first child of the inner div at line 1743 (after the div opens):
<div style={{
  position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
  background: `radial-gradient(ellipse at center, ${arch.color}0f 0%, transparent 65%)`,
  animation: `worldglow ${glowPeriod}s ease-in-out infinite`,
}} />
```

The inner div at line 1743 needs `position: 'relative'` if it doesn't already have it.

- [ ] **Step 3: Add presence ring shimmer in HomeScreen**

The PresenceRing is at ~lines 1413-1414 inside a `position: relative, width: 130, height: 130` div. Add a shimmer overlay after the PresenceRing div:

```js
// After line 1414 (PresenceRing), still inside the position:relative outer div:
<div style={{
  position: 'absolute', inset: 0, borderRadius: '50%', overflow: 'hidden', pointerEvents: 'none',
  opacity: 0.15, zIndex: 2,
}}>
  <div style={{
    position: 'absolute', inset: 0, borderRadius: '50%',
    background: 'conic-gradient(transparent 0%, transparent 60%, rgba(255,255,255,0.9) 78%, transparent 84%, transparent 100%)',
    animation: 'ringshimmer 8s linear infinite',
  }} />
</div>
```

- [ ] **Step 4: Verify inner div in MainApp has position relative**

Check line ~1743:
```js
<div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
```
If `position: 'relative'` is missing, add it.

- [ ] **Step 5: Verify build**

```bash
cd /Users/williammorel/NÉYA && npm run build 2>&1 | tail -20
```

- [ ] **Step 6: Commit**

```bash
cd /Users/williammorel/NÉYA && git add src/App.jsx && git commit -m "feat: worldglow ambient overlay + presence ring shimmer"
```

---

### Task E: Deploy to production

After all 4 animation tasks pass:

- [ ] **Step 1: Final build check**

```bash
cd /Users/williammorel/NÉYA && npm run build 2>&1
```

Expected: Clean build, no errors.

- [ ] **Step 2: Deploy**

```bash
cd /Users/williammorel/NÉYA && vercel --prod
```

- [ ] **Step 3: Verify deployment**

Production URL: `https://neya-kappa.vercel.app` — confirm app loads without black screen.
