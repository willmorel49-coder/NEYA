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
**Phase** : V1.4 — Audio riche multi-couche, polish sensoriel complet, micro-interactions mobiles

### Features actives (`src/App.jsx`) — build 201 kB (62 kB gzip)

**Splash :**
- 12 étoiles ultra-discrètes (splashtw breathing)
- Returning user : 4.3s vs 3.1s new user · haptic [4] sur départ
- Texte retour : "tu es encore là" (<4h) / "tu es revenu·e" (<7j) / "tu es de retour" (≥7j) + nom du dernier monde

**Onboarding :**
- 3 écrans avec blackout cinématique entre chaque
- Screen0 : bg-onboarding.png · hint slide-in à 5.5s
- Screen1 : texte séquentiel · halo de profondeur · hint slide-in à 5.2s
- Screen2 : slide fade in

**Rituel :**
- Couleur : 8 orbes positionnés via `translate(-50%,-50%)` (bug centering fixed) · selectedGlow pulse · label flash 12px slide-up-exit · vignette radiale
- Texture : mots épars · isolation avec textzoom bloom (scale 0.92→1) · touch feedback + hit area élargi
- Son : 4 sons · soundbar par signature sonore (pluie/vent/feu) · silence 3 dots · symboles animés par type · ENTRER touch + hit area
- Progression 3 points : dot actif pulse (dotpulse 2.8s)
- Haptics : [6] step · [12,60,18] complétion · blackout teinté par monde (WORLD_BLACKOUT)

**6 Mondes :**
- Brume : 5 couches mist (dont 1 haute très lente 48s)
- Forêt : 6 God-rays (1 doré) + brume de sol verte (screen)
- Cosmos : 38 étoiles + 2 nébuleuses + aurora borealis 2 couches (34s/50s) + 3 étoiles filantes
- Feu : shimmer + 14 braises + crépitement bandpass(1900Hz)
- Eau : 5 ondulations + reflet de surface (eauGrad shimmer 11s)
- Vide : pouls radial + 20 motes

**Audio (Web Audio API) :**
- Pluie : highpass(2200)→lowpass(9000) + basse lowpass(110Hz) 12%
- Vent : bandpass(380) + LFO 0.08Hz + harmonique bandpass(760Hz) 28%
- Feu : lowpass(320) + sawtooth LFO 0.35Hz + crépitement bandpass(1900) sawtooth 4.6Hz 9%
- Silence : noop · Réverbe : ConvolverNode 2.2s, 14% wet
- Audio bridge : démarre à 0.022 dès WorldReveal, fade→0.04 à 1s (ponts le gap rituel→monde)
- Fade-in exp (tc=0.7s) · Fade-out exp (tc=0.3s) · setVolume exp · À 90s : →0.008

**WorldReveal :**
- Audio démarre immédiatement (bridge gap depuis rituel)
- Cursor | clignotant pendant frappe · haptic [2] sur nom du monde
- Arrow "→" drifts 4px (arrowdrift 2.2s) sur "espace vrai →"
- Haptic [4] sur entrée EspaceVrai

**EspaceVrai :**
- User presence : pulse + 2 cercles ripple (userRipple 7s staggerés)
- "tu prends ton temps" à 30s
- Insight monde dominant : phrase spécifique par monde (6 variantes)
- Adieu time-aware : bonne nuit (22h-5h) / à tout à l'heure (matin) / à demain (jour)
- Long-press logo : feedback visuel opacity 0.55 pendant pression
- "encore ici" à top:13% (évite overlap compteur)

**Transitions :**
- Blackout 380ms teinté par le monde de destination (WORLD_BLACKOUT)
- Grain texture global (SVG data URI, mix-blend-mode overlay 0.038)
- Fade component : slide=true (translateY 7px) · delay prop disponible

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
