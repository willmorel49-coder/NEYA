# ROBOT.md — NÉYA

> Slim ≤ 200 lignes. Doc volumineuse dans `.claude/skills/` (lazy-loaded).

## 1. Identité

**NÉYA** — App de bien-être émotionnel gamifiée, prolongement digital de la marque ÇA VA?.

- **Repo** : `https://github.com/willmorel49-coder/NEYA`
- **Prod** : [https://neya-kappa.vercel.app](https://neya-kappa.vercel.app)
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

**Date** : 2026-05-09
**Branche** : `main`
**Phase** : V2.0 — Deep Polish · Présence étendue · Micro-animations universelles

### Features actives (`src/App.jsx`) — build 268.96 kB (74.57 kB gzip)

**Splash :** 15 étoiles · tint overlay monde · texte retour contextuel (<4h/7j/≥7j) · whisper time-of-day · haptic [4]
**Onboarding :** 3 écrans cinématiques · `ob0breathe` 42s bg · texte séquentiel · ENTRER bottom:14%
**Rituel :** couleur (flash bloom) · texture (stagger mots) · son (soundbar) · 3 dots progression dotpulse · haptic tri-étapes
**6 Mondes :** brume (5 couches drift diagonal) · forêt (6 god-rays raydrift) · cosmos (38 étoiles + aurora + filantes) · feu (14 braises crépitement) · eau (5 ondulations + reflets) · vide (2 pulsations + 25 motes)
**Audio :** Web Audio API · pluie/vent/feu/silence · ConvolverNode 2.2s 14% wet · ramp EspaceVrai 90s→0.008
**WorldReveal :** cerf période monde-spécifique · phrase phrasebreathe après frappe · worldnamebreathe · cursor | frappe · haptic [2]→[4]
**EspaceVrai :** ripple 2 cercles · PATIENCE_TEXTS@30s · flux dots 38% palette monde · h1/h2pulse · DEEP_TEXTS@90s · solbreathe · adieu time-aware · long-press → résumé rituel 4s · halo per-archetype
**Animaux-esprits :** SpiritAnimal dispatcher (Phoenix/Wolf/Bear/Deer) · size 40 TransitionScreen / 210 PatronusReveal / 74 HomeScreen ring
**Quiz :** ambient archétype tint · choiceripple 600ms · re-sélection pré-Continuer
**Main App :** 4 tabs (Accueil/Routines/Quêtes/Boutique) · BoutiqueScreen collection + accordion + CTA cava-brand.com
**Transitions :** animalfloat/animalbreathe · tabslideIn 220ms · forcespring stagger · blackout 380ms teinté · grain 0.038 · ringshimmer 8s · worldglow période monde-spécifique
**Histoire :** neya_history max 90 entrées · getDominantColor (4+/3+) · getDominantWorld (5+/3+) · streak consécutif

**V1.8-1.9 (sprints 15-37) :**
- HomeScreen : streak · milestones (motes sur 7/14/21/30/60/100) · jourComplète card · intention cycle ↻ · stat cards → tabs · presenceLabel archétype
- ReturningScreen micro-splash (1.9s spirit animal) · whisper time-aware · salutation time-of-day
- EspaceVrai : PATIENCE_TEXTS par archétype (30s) · PRESENCE_LABELS · adieu time-aware · haptic [2,80,2]@12s
- QuizScreen : ambient tint archétype · ripple `choiceripple` · re-sélection possible
- `getCurrentStreak()` · `neya_history` max 90 entrées · getDominantColor/World

### Assets dans `public/`
`cerf.svg` · `bg-onboarding.png` · `bg-brume.png` · `bg-foret.png` · `bg-cosmos.png` · `bg-feu.png` · `bg-eau.png` · `bg-vide.png` · `bg-vrai.png` · `bg-cosmos-alt.png`

**V2.0 — micro-animations universelles (sprints 38-190) :**
- CTAs & milestones : milestoneGlow sur tous les CTAs principaux (PatronusReveal, QuizIntro, ResultScreen, RoutinesScreen allDone, QuetesScreen allDone, SplashScreen, Boutique) · seedPulse sur BottomNav badge, QuetesScreen icons, ResultScreen force icons, RoutinesScreen done button
- Textes statiques → phrasebreathe (1→0.86→1) : SplashScreen title/subtitle/whisper, TransitionScreen title, HomeScreen profil/element/presenceLabel/presences/weekcount/intentionLabel, QuetesScreen header/allDone texts, RoutinesScreen header/h2/allDone subtext/desc, PatronusReveal tous les labels, ReturningScreen animal, IntroScreen body/title/hint, QuizIntro paragraphs/footer, ResultScreen worldInsight/forces/intention/desc, EspaceVraiModal ESPACEACCOMPANY/encoreIci/showPatience/showDeep/animal label, Boutique footer/separator/col.desc/Partager, NeyaLogo NÉYA
- Dividers & accents : worldglow sur séparateurs (TransitionScreen, IntroScreen, ResultScreen, EspaceVrai), accent bars ResultScreen
- Toasts : presence toast milestoneGlow, boutique CTA toast milestoneGlow
- Conditionnels : jourComplète title milestoneGlow, QuetesScreen quest title milestoneGlow quand done, routines title milestoneGlow quand done, EspaceVrai "Espace de présence" milestoneGlow/phrasebreathe selon typingDone
- Animations combinées (fadeIn + phrasebreathe) : PatronusReveal animal/profil/guide/élément, EspaceVraiModal encoreIci/ESPACEACCOMPANY
- Autres : ReturningScreen salutation time-of-day, HomeScreen double-tap restart, BottomNav active glow, QuizScreen progress bar glow, ResultScreen scale, Boutique accordion stagger tabslideIn, EspaceVrai halo per-archetype

### Déploiement
- `vercel.json` configuré · `npm run build` → `dist/` fonctionnel
- Prod live : `https://neya-kappa.vercel.app` · Commit `7bac143`

### Backlog code
- [ ] Valider performance mobile (animations nombreuses — worldglow + ringshimmer + forcespring)
- [ ] Mettre à jour l'URL Boutique quand cava.fr est prêt (chercher `cava-brand.com` dans App.jsx)

### Actions Will (hors code)
- [ ] Valider visuellement les animaux-esprits sur mobile (phoenix / wolf / bear / deer)
- [ ] Valider haptic feedback sur iOS
- [ ] Mettre à jour l'URL Boutique quand cava.fr est prêt (chercher `cava-brand.com` dans App.jsx)
