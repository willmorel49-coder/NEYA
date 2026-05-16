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

### Anti-patterns explicites (NE PAS FAIRE)

- ❌ **Coder un nouveau cap design sans 2-3 refs visuelles** (Pinterest/Dribbble/screenshots). Pattern de 3× rejet d'affilée si on devine. → Toujours demander les refs avant.
- ❌ **Ajouter avant de purger** — Will : "on est partie trop loin". Si une zone est saturée, purger d'abord, ajouter après.
- ❌ **Installer une lib UI** (shadcn, Radix, vaul, sonner, framer-motion…). NÉYA reste sans dépendance UI. Porter les patterns à la main.
- ❌ **Refactoriser en multi-fichiers** sans accord explicite. Garder les écrans mono-fichier.
- ❌ **Toucher aux images CaVa** : SEUL CaVa utilise `/cava/brand/*.jpg`. Le reste de l'app utilise `/img/world-*.png` et `/img/spirit-*.png`.
- ❌ **Bypasser hooks pre-commit / signatures** avec `--no-verify` / `--no-gpg-sign`.
- ❌ **Scroll infini sur ÇA VA?** — page condensée style catalogue (cf. memory `project_cava_brandbook`).
- ❌ **Magicui Meteors/Sparkles/Globe/Border Beam**, **Aceternity Background Beams**, **IBM Carbon density**, **Material ripple** — clashent avec calme NÉYA.

### Definition of Done (toute livraison)

Une tâche n'est terminée QUE si tous les points cochent :

1. ✅ **Build clean** — `cd /Users/williammorel/NÉYA && npm run build` finit sans erreur ni warning bloquant
2. ✅ **Pas de `console.log`** laissé dans le code touché
3. ✅ **DA respectée** — pearl glass cream/ink, Fraunces italic, hit zones ≥ 44×44, accents par monde
4. ✅ **Pas de stuck-states** — conditional render plutôt qu'opacity tricks
5. ✅ **Cleanup useEffect** — tous les timers/listeners/intervals/observers ont leur return cleanup
6. ✅ **Mode autonome** — Will autorise déploiement direct prod (cf. `feedback_autonomous_mode`). Commit + `vercel --prod --yes` + `git push origin main` quand fini.
7. ✅ **Vérif HTTP** — `curl -sI https://neya-kappa.vercel.app | head -1` doit retourner HTTP 200 après deploy
8. ✅ **Commit Co-Authored-By Claude** — message via heredoc ou `git commit -F /tmp/msg.txt` pour éviter EOF
9. ✅ **Récap concis à Will** — 1 message court avec lien clickable + résumé visible du changement

## 9. État actuel

> Mettre à jour à chaque savepoint.

**Date** : 2026-05-11
**Branche** : `main`
**Phase** : V3.0 — Animaux-esprits images réelles · Nettoyage ghost/quiz

### Features actives (`src/App.jsx`) — build 398.07 kB (101.95 kB gzip)

**Splash :** 15 étoiles · tint overlay monde · texte retour contextuel (<4h/7j/≥7j) · whisper time-of-day · haptic [4]
**Onboarding :** 3 écrans cinématiques · `ob0breathe` 42s bg · texte séquentiel · ENTRER bottom:14%
**Rituel :** couleur (flash bloom) · texture (stagger mots) · son (soundbar) · 3 dots progression dotpulse · haptic tri-étapes
**6 Mondes :** brume (5 couches drift diagonal) · forêt (6 god-rays raydrift) · cosmos (38 étoiles + aurora + filantes) · feu (14 braises crépitement) · eau (5 ondulations + reflets) · vide (2 pulsations + 25 motes)
**Audio :** Web Audio API · pluie/vent/feu/silence · ConvolverNode 2.2s 14% wet · ramp EspaceVrai 90s→0.008
**WorldReveal :** cerf période monde-spécifique · phrase phrasebreathe après frappe · worldnamebreathe · cursor | frappe · haptic [2]→[4]
**EspaceVrai :** ripple 2 cercles · PATIENCE_TEXTS@30s · flux dots 38% palette monde · h1/h2pulse · DEEP_TEXTS@90s · solbreathe · adieu time-aware · long-press → résumé rituel 4s · halo per-archetype
**Animaux-esprits :** SpiritAnimal SVG (Phoenix/Wolf/Bear/Deer) conservé pour TransitionScreen (72) · CoconScreen totem icon (28) · HomeScreen totem ambient (160, opacity 0.04) — toutes les autres occurrences remplacées par `<img src="${B}spirit-{archetype}.jpg">` circulaire : PatronusReveal (220) · CoconScreen central (200) · HomeScreen ring (74) · ReturningScreen (130) · ResultScreen phases 1+2 (60/34) · GrandVoyage (120)
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

**V2.1 — Deep polish & ambient life (sprints 191-232) :**
- Celebration particles : RoutinesScreen + QuetesScreen burst milestoneMote · PatronusReveal ambient motes (step 3+) · EspaceVrai typing completion 4 particles
- Ambient particles : MainApp ghost spirit animal (bottom-right 0.026 opacity) · MainApp 8 motes per-archetype all tabs · TransitionScreen archetype motes · EspaceVrai 8 motes per-archetype · Boutique all-done cards motes · RoutinesScreen/QuetesScreen all-done cards motes · QuizIntro WolfSpirit ghost
- Ghost animals + animalbreathe : SplashScreen DeerSpirit · IntroScreen PhoenixSpirit + BearSpirit · QuizIntro WolfSpirit · all now float+breathe
- Bg breathing : QuizScreen background bgbreathe 32s · Boutique collection card ob0breathe 38s
- Responsive animations : ring shimmer opacity scales with presenceProgress · HomeScreen intention card border/glow brightens when all routines done · ResultScreen force cards presencePulse when all forces shown
- State-driven animations : ReturningScreen worldInsight phrasebreathe · today dot presencePulse when not yet done · stat card ✦ seedPulse when done · partial progress bars worldglow · quiz dot separator phrasebreathe · quiz final button deeper glow · quiz progress bar fill worldglow · selected choice text phrasebreathe 16s
- UX interactions : intention cycling 3 particles burst · HomeScreen restart confirm milestoneGlow · EspaceVrai long-press 800ms → ritual summary 4s overlay
- Boutique polish : separator lines worldglow · collection tags phrasebreathe staggered · accordion spirit animal animalbreathe · ring spirit animal animalbreathe
- ResultScreen polish : phase 2 small spirit animal animalbreathe · force card backgrounds presencePulse all-shown
- IntroScreen body text step 0 phrasebreathe · QuizScreen final "Terminer" enhanced glow

**V2.2 — Quiz atmosphères · Animaux premium · Souffle (sprint 233+) :**
- Quiz : tint gradient unique par question (23/23) — chaque écran a son propre ciel coloré
- Animaux-esprits : redessin SVG complet — DeerSpirit path-based slim + antlers 4 branches organiques · PhoenixSpirit wings 3 couches + queue 7 plumes · WolfSpirit crinière aurora · BearSpirit élargi
- BreathingModal : exercice interactif par archétype — cercle morphique CSS transition, countdown, cycle counter, animal animé au centre · Techniques : Guerrier 4·4·4·4 / Ancrage 4·7·8 / Cohérence 5·5 / Créateur 4·8
- HomeScreen : carte "Exercice de souffle" visible dans Accueil, déclenche BreathingModal
- Fix critique : écran noir résolu — import React default + ErrorBoundary + animalbreathe opacity-only (commit b24f4a7)

**V3.0 — Animaux-esprits images réelles · Nettoyage ghost/quiz (prod live, commit b118ba5) :**
- 4 images de référence copiées dans `public/` : `spirit-resilience.jpg` · `spirit-presence.jpg` · `spirit-sagesse.jpg` · `spirit-lumiere.jpg`
- Toutes les occurrences importantes : remplacement de `<SpiritAnimal>` SVG par `<img>` circulaire (objectFit cover, borderRadius 50%, drop-shadow archétype) — PatronusReveal · CoconScreen · HomeScreen ring · ReturningScreen · ResultScreen · GrandVoyage
- Ghost/ambient supprimés : SplashScreen · IntroScreen · QuizIntro · EspaceVrai backdrop + guide · MainApp ghost bottom-right · Boutique collection ring + accordion
- WorldUnlockModal + WorldCard header : remplacés par orbe lumineux + emoji monde (◈ / 🌫/🔥/🌿/💧/✨/🌀)
- BreathingModal center : remplacé par SVG breath wave (circle + courbe sinusoïdale)
- HomeScreen breathing card icon : breath wave SVG · cocon card icon : cristal hexagone SVG
- Boutique accordion expanded + collection ring : remplacés par ◈ coloré archétype
- Règle : animaux-esprits SVG uniquement pour TransitionScreen pre-révélation (72) · CoconScreen totem icon (28) · HomeScreen totem ambient fantôme (160, opacity 0.04)

**V2.7 — PersonalizationModal · CoconScreen items toggle · HomeScreen cocon ambiance (prod live) :**
- `PersonalizationModal` : prénom / mantra / nom du cocon — sauvegarde localStorage
- HomeScreen header : salutation personnalisée `"Bonjour, {prénom}"` + bouton ✎ + mantra italic
- CoconScreen items tappables : `placed` state, `togglePlaced()`, badge `✦ Dans ton cocon` / `Touche pour placer`
- HomeScreen ambient layer : items placés → bougie (emberRise) / cristal (godRay) / plante (splashmote) / totem (ghost animal) / portail (waterRing)

**V2.5–V2.6 — CoconScreen · BgScreen · Quiz · Grand Voyage :**
- `NeyaGirl` SVG inline (fille de dos, cheveux bleus #3b82f6)
- `CoconScreen` : sanctuaire personnel full-screen overlay (position: fixed, zIndex: 800) · SpiritAnimal size=200 flottant · NeyaGirl centrée · 5 items à débloquer (Bougie/Cristal/Plante/Totem/Portail) · grille 2×2+1 glassmorphisme · unlock basé streak + jours visités · stats streak/jours
- HomeScreen : card "Mon Cocon Néya" après Exercice de souffle · ouvre CoconScreen
- `BgScreen` : nouveau prop `bgPosition = 'center'` (remplace valeur hardcodée)
- Quiz backgrounds diversifiés : `bg-cosmos-alt.png` (Ta relation aux autres, Quand l'imprévu) · `bg-vide.png` (Ta vision du bonheur, Face à une échéance, Ton moteur intérieur)

**V2.3 — Backgrounds MONDE IMAGINAIRE · Effects monde (commit 01d355d) :**
- 8 fonds remplacés par les images de référence Will (dossier NÉYA/NÉYA/) :
  `bg-onboarding` (fille teal + cité dorée NÉYA) · `bg-vrai` (cerf blanc cercle lumineux + reflet eau)
  `bg-foret` (ours lumineux en forêt nuit) · `bg-brume` (loup lumineux + fille désert brumeux)
  `bg-cosmos` (aurora nébuleuse canyon) · `bg-eau` (cerf doré + fille cheveux bleus en forêt)
  `bg-vide` (arche caverne éthérée + lac) · `bg-cosmos-alt` (fille + trail esprit canyon)
- EspaceVrai effects par archétype : resilience=10 braises (emberRise) · presence=4 anneaux eau (waterRing) · sagesse=5 nappes brume (mistDrift) · lumiere=6 triangles god-ray (godRay)
- CSS keyframes ajoutés : `emberRise`, `waterRing`, `mistDrift`, `godRay`, `forestMote`

### Déploiement
- `vercel.json` configuré · `npm run build` → `dist/` fonctionnel
- Prod live : `https://neya-kappa.vercel.app` · Commit `01d355d`

### Backlog code
- [ ] Valider performance mobile (animations nombreuses — worldglow + ringshimmer + forcespring)
- [ ] Mettre à jour l'URL Boutique quand cava.fr est prêt (chercher `cava-brand.com` dans App.jsx)

### Actions Will (hors code)
- [ ] Valider visuellement les animaux-esprits sur mobile (phoenix / wolf / bear / deer)
- [ ] Valider haptic feedback sur iOS
- [ ] Mettre à jour l'URL Boutique quand cava.fr est prêt (chercher `cava-brand.com` dans App.jsx)
