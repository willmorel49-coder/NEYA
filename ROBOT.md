# ROBOT.md — NÉYA

> Slim ≤ 200 lignes. Doc volumineuse dans `.claude/skills/` (lazy-loaded).

## 1. Identité

**NÉYA** — App de bien-être émotionnel gamifiée, prolongement digital de la marque ÇA VA?.

- **Repo** : `https://github.com/willmorel49-coder/NEYA`
- **Prod** : `# ← à remplir (Vercel, après déploiement)`
- **Owner** : Will · macOS · VS Code · réponses en français
- **Statut** : MVP en cours

**Philosophie produit non-négociable** : Espace émotionnel esthétique, premium et humain — adulte, poétique, épique. Jamais clinique ni infantilisant. Gamification non-toxique : présence récompensée, pas performance. Pas de classement, pas de comparaison.

## 2. Stack

| Couche | Tech |
|---|---|
| Frontend | React 18 + Vite 5 (JSX single-file, `src/App.jsx`) |
| Backend | Aucun (MVP) |
| BDD | Aucune (MVP) |
| Tests | Aucun (MVP) |
| Lint | Aucun (MVP) |
| CI | Aucune |
| Hébergement | Vercel (à configurer) |

## 3. Variables d'environnement

Aucune pour l'instant (pas de backend).

## 4. Commandes

```bash
# Dev local
npm run dev   # http://localhost:5173

# Build prod
npm run build

# Preview build
npm run preview
```

## 5. Stratégie git

- **Branche principale** : `main`
- **Branches** : `feat/<scope>` / `fix/<scope>` / `chore/<scope>` / `claude/<task>`
- **Commits** : conventional commits (`feat:`, `fix:`, `chore:`, `style:`, `refactor:`)

## 6. Skills disponibles

Lazy-loaded dans `.claude/skills/`. Charge à la demande.

| Skill | Quand l'invoquer |
|---|---|
| `neya-da` | Direction artistique, palette, typographie, composants visuels |
| `neya-structure` | Architecture, modules, écrans, organisation des fichiers |

## 7. Sub-agents

Aucun pour l'instant.

## 8. Workflow Claude pour ce projet

### Démarrage

Lis `tasks/lessons.md` + `tasks/todo.md`, dis ce qui est en cours.

### Conventions

**Build de référence** : `neya-final.jsx` (alias `neya-aventure.jsx`) — single-file React. Toujours itérer sur l'existant, jamais repartir de zéro.

**Design system** :
- Fond `#050810` · Indigo `#6366f1` · Magenta `#ec4899` · Teal `#14b8a6` · Gold `#f59e0b`
- Display : Sora · Body : Inter
- Fille cheveux bleus, toujours de dos · Esprits animaux géants et lumineux
- Esthétique semi-réaliste picturale · Fonds sombres immersifs par monde émotionnel

**Copy anchors** : "Et toi, ça va vraiment ?" · "T'as pas besoin d'aller bien pour commencer" · "Tu n'es pas seul.e"

**Collaboration** : instructions courtes → code direct. Dépendances minimales. Partage images de ref pour valider DA.

### Pièges connus à NE PAS reproduire

- Ne jamais refactoriser en multi-fichiers sans accord explicite de Will
- Ton jamais clinique, médicalisé ou startup générique
- Pas de mécaniques de classement, comparaison ou validation publique
- Ne pas ajouter de features non demandées (scope discipline stricte)
- Ne pas proposer de réécriture complète — toujours itérer sur `neya-final.jsx`

## 9. État actuel

> Mettre à jour à chaque savepoint.

**Date** : 2026-05-07
**Branche** : `main`
**Phase** : V1.3 — Micro-polish sensoriel complet, audio exponentiel, animations organiques

### Features actives (`src/App.jsx`)

**Core flow :**
- Splash screen : logo NÉYA pulse adaptatif (3.5s new user / 4.8s returning — plus intime)
  - Retour récent (<7j) : "tu es revenu·e" + nom du dernier monde (ultra-discret)
  - Absence longue (≥7j) : "tu es de retour"
  - Hint "toucher" sur Screen0 onboarding après 5.5s
- Onboarding 3 écrans : bg-onboarding.png, texte séquentiel, hint "toucher"
- Rituel : couleur (8 orbes respirants + selectedGlow sur sélectionné) → texture (flash isolé + slide) → son (Web Audio API + soundbar + slide)
- CONTINUER / ENTRER DANS LE MONDE : slide entrance
- Indicateur de progression 3 points discrets en bas du rituel
- Haptic : [6] steps 0→1 et 1→2 · [12,60,18] complétion
- Raccourci M : mute/unmute clavier

**6 Mondes (sélection automatique sound × texture) :**
- Brume : `bg-brume.png` + brume dérivante 4 couches (hauteur variée)
- Forêt : `bg-foret.png` + 6 God-rays (incl. 1 doré + 1 panoramique large)
- Cosmos : `bg-cosmos.png` + 38 étoiles (couleurs chaudes/froides/neutres) + 3 étoiles filantes
- Feu : `bg-feu.png` + shimmer + 14 braises montantes (couleurs 100-180 vert)
- Eau : `bg-eau.png` + 5 ondulations (stroke teal pour periph.)
- Vide : `bg-vide.png` + pouls radial + 20 motes flottantes

**Phrases :**
- 4 variantes par texture × monde (total 144 phrases)
- Sélection déterministe par couleur (colorIdx % 4) — pas aléatoire
- Typing speed adapté au monde : feu=30ms, cosmos=38ms, brume=44ms, eau=46ms, forêt=50ms, vide=64ms

**Audio (Web Audio API) :**
- Pluie : bruit blanc highpass(2200) → lowpass(9000)
- Vent : bruit bandpass(380) + LFO 0.08Hz (vent qui varie)
- Feu : bruit lowpass(320) + LFO sawtooth 0.35Hz (fluctuations)
- Silence : noop (pas de son)
- Réverbe atmosphérique : ConvolverNode 2.2s, send parallèle 14% wet
- Fade-in : setTargetAtTime(volume, t, 0.7) — courbe exponentielle naturelle
- Fade-out : setTargetAtTime(0, t, 0.3) — exponentiel, ctx.close() à 1.5s
- setVolume() : setTargetAtTime() — fondu naturel (tc = dur/4)
- Mute/unmute : exponentiel (tc=0.15s)
- À 90s : fade vers 0.008 (tc=2s) — audio quasi-silence

**WorldReveal :**
- Phases : black → world (1s) → name (2.8s) → phrase (4.6s)
- Typing effect par monde (30–64ms/char)
- worldBreathe adapté à la texture (speed variable)
- cerfdrift : rotation organique ±0.8°
- Overlays atmosphériques par monde
- Ambiance persist vers EspaceVrai (stopAmbienceRef)
- Slide sur phrase + "espace vrai →" (touch feedback mobile)

**EspaceVrai :**
- Fond du monde actif : espacebreathe 38s (respiration subtile)
- Teinte personnelle (dominantColor, ~4%) + dominantShimmer 28s
- Nom du monde géant : worldnamepulse 45s (0.018→0.026 opacity)
- Flux anonyme (22 orbes + présence utilisateur pulse)
- Histoire silencieuse : spirale Fibonacci, h0pulse 3.8s sur dot actuel
- Cerf fantôme : cerfdrift-ghost 42s + rotation organique ±0.6°
- Compteur de présences (après 5s, slide)
- "première présence" pour 1er utilisateur (7s, ultra-discret)
- Whisper du monde (4.5s, slide)
- "encore ici" si même monde que visite précédente (3.2s)
- Résumé rituel (2.5s, slide)
- "tu n'es pas seul·e" (0.8s, slide)
- Insight "tu reviens souvent ici" si monde dominant (8.5s)
- Bouton "nouveau rituel" après 12s + touch feedback mobile
- Long-press logo → reset histoire avec confirmation
- À 90s : voile nocturne teinté par monde.palette[0]6e + haptic [8,60,8] + "à demain" slide + fade audio

**Transitions :**
- Blackout 380ms entre les écrans majeurs
- Grain texture global (SVG data URI, mix-blend-mode overlay 0.038)
- Fade component : slide=true (translateY 7px)

**Histoire silencieuse :**
- `localStorage['neya_history']` : max 90 entrées {ts, color, texture, sound, world}
- Chargée au démarrage, sauvée après chaque rituel
- Spirale Fibonacci dans EspaceVrai (angle d'or 2.3998 rad)
- getDominantColor() : 4+ rituels, 3+ même couleur
- getDominantWorld() : 5+ rituels, 3+ même monde

### Assets dans `public/`
`cerf.svg` · `bg-onboarding.png` · `bg-brume.png` · `bg-foret.png` · `bg-cosmos.png` · `bg-feu.png` · `bg-eau.png` · `bg-vide.png` · `bg-vrai.png` (non utilisé)

### Déploiement
- `vercel.json` configuré
- `npm run build` → `dist/` fonctionnel
- Déploiement Vercel : **à faire par Will** (`vercel --prod` ou import sur vercel.com)

### Backlog code
- [ ] Déploiement Vercel (URL prod à renseigner dans §1)
- [ ] Valider performance sur mobile (animations CSS nombreuses)
- [ ] Tests de régression avant chaque session

### Actions Will (hors code)
- [ ] Déployer sur Vercel + ajouter URL prod dans §1
- [ ] Valider visuellement les 6 mondes sur mobile
- [ ] Valider haptic feedback sur iOS (navigator.vibrate)
