# NÉYA — Sound Design System

> *Direction sonore émotionnelle premium · Web Audio API procédural · zéro fichier audio.*
> Philosophie : le son comme refuge sensoriel, jamais comme intrusion.

---

## 1. Direction sonore globale

NÉYA refuse les sons mobiles génériques (ding ! buzz ! tada !). Refuse aussi les fichiers `.mp3` qui alourdissent (1.5 MB par boucle moyenne).

**Stratégie** : tout est généré à la volée via Web Audio API. **0 KB de poids réseau.** Synthèse procédurale avec :
- Oscillateurs sinusoïdaux (sons purs, contemplatifs)
- Cloches inharmoniques (4 partiels à ratios 1.0 / 2.4 / 3.7 / 5.2 — caractère méditatif tibétain)
- Bruit filtré (souffle de respiration via BiquadFilter bandpass)
- Enveloppes ADSR douces (attaque rapide < 5ms, décroissance lente 200-1400ms)

### 5 principes inviolables

1. **OFF par défaut** — le silence est un droit. Toggle visible dans Personnaliser.
2. **Master gain bas** : `0.25` (≈ -12 dB). Jamais agressif.
3. **Durée max 2s** par son d'interaction. La cloche peut résonner 1.4s, le tap dure 180ms.
4. **`prefers-reduced-motion`** respecté (utilisateurs audio-anxieux le réclament aussi).
5. **Aucun autoplay long**. Pas de musique de fond imposée.

---

## 2. Architecture (`src/audio.js`)

```
src/audio.js
  ├── AudioContext singleton (lazy init au 1er user gesture)
  ├── masterGain (0 si off, 0.25 si on, transition 50ms)
  ├── isEnabled() / setAudioEnabled() / getAudioEnabled()
  ├── Primitives :
  │     ├── _tone()  — oscillateur ADSR simple
  │     ├── _bell()  — cloche inharmonique 4 partiels
  │     ├── _swell() — glide fréquentiel
  │     └── _noise() — bruit filtré bandpass
  └── Library publique :
        ├── playTap()            — UI feedback (sine 880Hz, 180ms)
        ├── playConfirm()        — 2-note quinte ascendante
        ├── playSouvenir()       — 3-note arpège majeur (cloche)
        ├── playChime(index)     — 1 cloche d'une pentatonique 12 notes
        ├── playRelease()        — swell descendant + souffle noise
        ├── playBreathIn(dur)    — souffle ascendant filtré 400→1400 Hz
        ├── playBreathOut(dur)   — souffle descendant 1400→300 Hz
        ├── playOpen()           — swell ascendant 220→440 Hz
        ├── playClose()          — swell descendant 440→220 Hz
        ├── playMilestone()      — accord majeur C-E-G-C pad sustained
        └── initAudioPressFeedback() — listener global [data-press]
```

---

## 3. Sound identity NÉYA

### Palette tonale
- **Tonique** : C (Do) — neutralité, ancrage
- **Échelle** : Pentatonique majeure C (Do Ré Mi Sol La Do' Ré' Mi' Sol' La' Do'' Ré'')
- **Pas de mineur sombre, pas de quartes augmentées** — psychologie consonante uniquement
- **Intervalles privilégiés** : quinte juste (5/3), octave (2/1), tierce majeure (5/4)

### Timbre
- **Cloches inharmoniques** = caractère méditatif (rappelle les cloches tibétaines / bols chantants)
- **Sinusoïdes pures** = sons "doux" sans rugosité harmonique
- **Bruit blanc filtré** = souffle (respiration humaine simulée)

### Rythme
- **Sons UI < 200ms** (pas de fatigue)
- **Cloches 800-1400ms** (résonance complète)
- **Souffles 4-8s** (alignés sur cycles respiratoires)

---

## 4. Mapping sons → événements (10 wirés)

| Sound | Événement | Effet |
|---|---|---|
| **`playTap()`** | `data-press` pointerdown global | Confirmation tactile UI |
| **`playMilestone()`** | MilestoneCelebration mount | Moment cérémoniel J3/J7/J14/J30/J60/J100 |
| **`playRelease()`** | Libération tap pensée | Le poids tombe |
| **`playChime(i)`** | Apaisement dot lit (i de 0-11) | Pentatonique progressive |
| **`playBreathIn(dur)`** | BreathingModal phase "Inspire" | Souffle filtré qui s'ouvre |
| **`playBreathOut(dur)`** | BreathingModal phase "Expire" | Souffle filtré qui descend |
| **`playSouvenir()`** | Cocon souvenir chip tap | 3-note arpège joyeux |
| **`playConfirm()`** | Toggle audio activé | Validation 2 notes |
| `playOpen()` | (P2 — à wirer sur modal open) | Swell ascendant |
| `playClose()` | (P2 — à wirer sur modal close) | Swell descendant |

---

## 5. UI toggle (Personnaliser)

Nouveau champ **"Sons doux · facultatif"** dans la modale Personnaliser. Toggle iOS-style 44×26px avec thumb 20px qui glisse spring 280ms.

Texte : *"Toucher, souvenir, souffle. Subtil, jamais envahissant."*

À l'activation : `playConfirm()` confirme la mise en route. Master gain glisse de 0 à 0.25 en 50ms. La cohérence sonore est immédiate.

---

## 6. Mini-jeux — sound design détaillé

### Libération des pensées
- Tap pensée → `playRelease()` : `_swell(660→220 Hz, 550ms)` + `_noise(500ms, filtre 1200→400 Hz)`
- Effet : la pensée *tombe physiquement*, libération sensorielle
- Volume bas (peak 0.05) → 5 libérations rapides ne fatiguent pas

### Apaisement sensoriel
- 12 dots = 12 notes pentatoniques en montée (C4 → D5)
- Touch dot 0 = C4 (Do grave), dot 11 = D5 (Ré aigu)
- L'utilisateur compose involontairement une mélodie
- Chaque cloche dure ~1s, peak 0.05
- Effet : **gamification musicale invisible** — toucher tous les 12 = une "phrase"

### Souffle guidé
- Inspire = bruit filtré qui s'ouvre (filtre 400→1400 Hz) — sensation d'ouverture
- Expire = bruit filtré qui se ferme (1400→300 Hz) — sensation de relâche
- Durée alignée sur `phase.dur` (4s ou 8s)
- Volume 0.03 — *présence* sonore, pas une voix
- Effet : **synchronisation audio-respiration** réelle

### Milestone Celebration
- Accord C-E-G-C majeur (Do Mi Sol Do)
- 4 notes étagées 60ms entre chaque (arpège large)
- Attack 180ms (entrée douce), Sustain 1.6s (résonance), Release 800ms (decay long)
- Peak 0.06 par note → ensemble plein mais non écrasant
- Effet : **sentiment d'accomplissement majestueux**

---

## 7. Anti-patterns refusés

- ❌ Notifications "ding" type mobile banking
- ❌ Sons arcade 8-bit
- ❌ Bruits de boutons mécaniques (click cheap)
- ❌ Musique de fond imposée
- ❌ Sons "startup app" (whoosh + slogan)
- ❌ Master gain > 0.3 (fatigue)
- ❌ Frequencies > 4000 Hz (agressif)
- ❌ Durations > 2s sur interactions
- ❌ Sons sans option de désactivation
- ❌ Notifications push avec son

---

## 8. Spatialisation (P2 envisagée)

Web Audio API supporte le PannerNode. P2 prévu :
- Cocon avec ambiance stéréo (vent doux à gauche, eau à droite)
- Visiteurs paisibles : étoile filante traverse de gauche à droite avec pan correspondant
- Souvenir chip ribbon : chaque tap pan selon position du chip à l'écran

Pas implémenté en P1 pour rester monoBruyant testable rapidement.

---

## 9. Mémoire émotionnelle

Une fois l'audio activé, les sons deviennent **des marqueurs identitaires** :
- L'utilisateur reconnaît "le son de NÉYA" en 1 cloche
- Le 3-note arpège souvenir devient un signal de "tu as gagné quelque chose"
- Le bruit filtré du souffle remplace mentalement une voix de coach
- Le pattern haptic + son du milestone se grave comme un moment fort

**C'est ça l'identité sonore.** Pas un jingle. Une grammaire émotionnelle cohérente.

---

## 10. Roadmap audio

### P1 — Livré ✅
- 10 sons synthétisés (tap, confirm, souvenir, chime, release, breath in/out, open, close, milestone)
- Master gain + toggle UI
- 8 events wirés (data-press, MilestoneCelebration, LiberationPenseesModal, ApaisementSensorielModal, BreathingModal × 2, souvenir chip, audio toggle)
- Lazy AudioContext + autoplay-policy compliant
- `prefers-reduced-motion` respecté

### P2 — Court terme
- **Spatialisation stéréo** (PannerNode pour visiteurs + souvenirs)
- **Modal open/close** sounds wirés (déjà définis, pas encore connectés)
- **Ambiance cocon** : drone pad très bas (~80 Hz) + texture noise filtrée
  - Vary by `getMeteo(vitality)` : brume = noise plus sombre, lueurs = harmonics ajoutés
  - Vary by `getTimeAmbience()` period : night = octave plus basse, dawn = harmonics doux
  - Toggleable séparément du UI sounds
- **Quiz answer** sound (sélection = chime court archétype-dépendant)

### P3 — Long terme
- **Reverb convolution** légère (impulse response synthétique 0.8s)
- **Sons spatialisés 3D** sur EspaceVrai (sensation d'enveloppement)
- **Mini-jeu "Sound Garden"** — toucher l'écran joue des notes pentatoniques composables, l'utilisateur crée des paysages sonores stockés en souvenirs

---

## 11. Métriques

| Mesure | Cible | État |
|---|---|---|
| Bundle JS audio | < 10 KB | ✅ ~6 KB |
| Latence tap → son | < 50ms | ✅ Web Audio scheduler |
| AudioContext init | sur user gesture | ✅ lazy |
| Mute par défaut | oui | ✅ |
| reduced-motion respect | oui | ✅ (via `isEnabled()` check) |
| Master gain | ≤ 0.30 | ✅ 0.25 |
| Frequency range | 80 Hz - 4000 Hz | ✅ |

---

## 12. Sensation finale visée

> *« Cet univers respire. Le son me calme. Je touche un point — une note se pose.*
> *Je libère une pensée — elle tombe en souffle. Je traverse un palier — un accord majeur résonne.*
> *Personne ne m'a dit qu'il fallait écouter. Mais j'écoute. *
> *Et NÉYA, je la reconnais maintenant. *
> *Elle a une voix. »*

C'est l'âme sonore d'une app de soin émotionnel.
