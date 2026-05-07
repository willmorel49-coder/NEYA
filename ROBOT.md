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
**Phase** : V1.1 — Univers complet 6 mondes, histoire silencieuse, overlays atmosphériques

### Features actives (`src/App.jsx`)

**Core flow :**
- Splash screen : logo NÉYA pulse, 3s, bypass onboarding si returning user ("tu es revenu·e")
- Onboarding 3 écrans : bg-onboarding.png, texte séquentiel, hint "toucher"
- Rituel : couleur (8 orbes respirants + flash label) → texture spatiale (teinte rituel) → son (Web Audio API + soundbar)
- Indicateur de progression 3 points discrets en bas du rituel

**6 Mondes (sélection automatique sound × texture) :**
- Brume (pluie + lourd/froid/rugueux) : `bg-brume.png`
- Forêt (vent + lourd/froid/rugueux) : `bg-foret.png` + rayons de lumière SVG
- Cosmos (vent + léger/doux/chaud) : `bg-cosmos.png` + 38 étoiles scintillantes
- Feu (feu + lourd/chaud/rugueux) : `bg-feu.png` + shimmer chaleur animé
- Eau (pluie + léger/doux/chaud) : `bg-eau.png` + ondulations SVG
- Vide (silence + léger/doux/chaud) : `bg-vide.png` + pouls radial

**WorldReveal :**
- Phases : black → world (1s) → name (2.8s) → phrase (4.6s)
- Nom du monde révélé avec animation letterSpacing
- Watermark NÉYA très transparent en fond
- Cerf teinté par monde (CSS filter), drift + breathing animation
- Overlays atmosphériques par monde
- Ambiance sonore démarre et persiste vers EspaceVrai

**EspaceVrai :**
- Fond du monde actif (très opacifié)
- Flux anonyme de présences (22 orbes + présence utilisateur)
- Histoire silencieuse : traces fantômes des rituels passés (localStorage)
- Cerf fantôme dans le coin (opacity 0.07)
- Compteur de présences (ultra-discret après 5s)
- Whisper du monde (phrase spécifique au monde après 4.5s)
- Résumé rituel (couleur · texture · son en bas à droite)
- "tu n'es pas seul·e" + whisper du monde
- Bouton "nouveau rituel" après 12s
- Long-press sur logo → reset histoire avec confirmation

**Transitions :**
- Blackout 380ms entre onboarding→rituel, rituel→monde, monde→espace vrai
- Grain texture global (SVG data URI, mix-blend-mode overlay)

**Histoire silencieuse :**
- `localStorage['neya_history']` : max 90 entrées {ts, color, texture, sound, world}
- Chargée au démarrage, sauvée après chaque rituel
- Visualisée dans EspaceVrai en points fantômes

### Assets dans `public/`
- `cerf.svg` — esprit animal lumineux, silhouette éthérée
- `bg-onboarding.png` — fille de dos, grotte + mandalas bleus
- `bg-brume.png` — fille face au loup-esprit lumineux
- `bg-foret.png` — arche végétale dorée
- `bg-cosmos.png` — fille sur falaise, épique
- `bg-feu.png` — falaise avec anneau solaire doré
- `bg-eau.png` — piscine circulaire, lanternes, étoiles
- `bg-vide.png` — chambre minimaliste, lumière solaire
- `bg-vrai.png` — non utilisé (remplacé par fond du monde actif)

### Déploiement
- `vercel.json` configuré
- `npm run build` → `dist/` fonctionnel
- Déploiement Vercel : **à faire par Will** (`vercel --prod` ou import sur vercel.com)

### Backlog code
- [ ] Déploiement Vercel (URL prod à renseigner dans §1)
- [ ] V1.2 : histoire silencieuse améliorée (visualisation temporelle)
- [ ] Tests de régression avant chaque session

### Actions Will (hors code)
- [ ] Déployer sur Vercel + ajouter URL prod dans §1
- [ ] Valider visuellement les 6 mondes sur mobile
