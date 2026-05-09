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

### Features actives (`src/App.jsx`) — build 265.84 kB (74.23 kB gzip)

**Splash :**
- 15 étoiles (splashtw) dont 3 dans la moitié basse (y:52-68%) · returning user : 4.3s / new : 3.1s
- Couleurs étoiles variées : ambre chaud `255,235,180` / bleu-blanc froid `220,235,255` / blanc pur — opacity dans fill alpha (splashtw compat)
- Tint overlay monde-spécifique (`lastWorldData.palette[1]` + opacity 0.07) pour returning users
- Texte retour : "tu es encore là" (<4h) / "tu es revenu·e" (<7j) / "tu es de retour" (≥7j) + monde
- Whisper temporel pour returning : "ce matin / cet après-midi / ce soir / cette nuit" à 2000ms (opacity 0.05)
- Haptic [4] sur départ returning user

**Onboarding :**
- 3 écrans · blackout cinématique entre chaque · haptic [4] sur entrée rituel
- Screen0 : bg-onboarding.png · `ob0breathe` 42s scale 1→1.028 sur bg · hint slide-in à 5.5s
- Screen1 : texte séquentiel · halo profondeur · textShadow indigo sur 4e ligne · hint à 5.2s
- Screen2 : 3 lignes séquentielles (600/1500/2400ms) · `showButton` à 4000ms · ENTRER absolu bottom:14% · halo radial indigo

**Rituel :**
- Haptic [3] sur chaque sélection · `ritualbg` 9s breathing quand couleur choisie
- Dot progression : actif = couleur du rituel `cc` (opacité 80%)
- Couleur : orbes `translate(-50%,-50%)` (bug fixé) · CONTINUER stagger 600ms · glow pulse
- Couleur : flash label avec `textShadow hex77 + hex33` bloom sur sélection
- Texture : stagger d'entrée par mot `wi * 85ms` + `mounted` 60ms · selected word textShadow `ritualColor`
- Son : stagger d'entrée par item `si * 90ms` + `mounted` 60ms · soundbar par signature
- Progression : 3 dots · actif pulse (dotpulse 2.8s) · haptic [6] step · [12,60,18] complétion

**6 Mondes :**
- Brume : 5 couches mist avec drift diagonal `translateX + translateY` (dont haute 48s, mixBlendMode screen)
- Forêt : 6 god-rays avec drift horizontal `raydrift${i}` 28-58s · wrapper+inner pour séparer drift/opacity · drifts [7,-5,4,-8,5,-3]px
- Cosmos : 38 étoiles + 3 nébuleuses + aurora 3 couches (34s/50s/70s) + Voie Lactée + 3 filantes
- Feu : shimmer 0.06-0.10 + 14 braises + crépitement bandpass(1900Hz)
- Eau : 5 ondulations (épicenter légèrement variés cy:57/59/58) + 2 reflets surface + profondeur radiale teal
- Vide : 2 pulsations radiales (12s/19s contre-phase) + 25 motes

**Audio (Web Audio API) :**
- Pluie : highpass(2200)→lowpass(9000) + sub lowpass(110Hz) 12%
- Vent : bandpass(380) + LFO 0.08Hz + harmonique bandpass(760Hz) 28%
- Feu : lowpass(320) + LFO sawtooth 0.35Hz + crépitement bandpass(1900) 9%
- Silence : noop · Réverbe ConvolverNode 2.2s 14% wet · bridge 0.022→0.04 · À 90s : →0.008
- Entrée EspaceVrai : ramp t1=1600ms→0.055, fade t2=90s→0.008

**WorldReveal :**
- Cerf : période spécifique par monde (vide:52s, feu:16s, cosmos:38s, eau:30s, brume:22s, foret:20s)
- Phrase : ombre teintée `world.palette[2]` + glow blanc · `typingDone` → `phrasebreathe 22s` (1→0.86→1)
- Nom du monde : `worldnamebreathe 18s 1.6s` (1→0.74→1) · textShadow discret
- NÉYA watermark : `neywatermark 55s` breathing continu
- Cursor | pendant frappe · haptic [2] nom du monde · arrow → drifts 4px · haptic [4] EspaceVrai

**EspaceVrai :**
- Présence user : ripple 2 cercles (r max 58px) + pulse rythmé par `ritual.sound` (pulseDur/rippleDur)
- "encore ici" : textShadow `world.palette[2]22` discret
- "tu prends ton temps" → 6 variants monde-spécifiques à 30s · haptic [2,80,2] à 12s
- Flux dots : `generateFakeFlux(ritual.color, worldKey)` — 38% bias palette monde pour cohérence visuelle
- Dots h1/h2 : `h1pulse 4.6s 0.9s` + `h2pulse 5.4s 2.1s` bloom asynchrone
- Insight dominant : textShadow `world.palette[2]25`
- Cerf fantôme : période x1.5 selon monde (vide:80s, feu:24s, cosmos:62s…)
- BG breathe : monde-spécifique (vide:72s, feu:22s, cosmos:58s…)
- "tu n'es pas seul·e" : solbreathe 22s (0.16→0.23) · whisper textShadow `world.palette[2]2a`
- Adieu : textShadow `world.palette[2]30`/`20` · time-aware : bonne nuit / la journée t'attend doucement / tu peux revenir
- Long-press logo : clears sur touchmove (bugfix drag) · résumé rituel delay 4000ms
- h0pulse bloom 0.09 · dominantShimmer 0.6→1 · "première présence" à 5000ms

**Animaux-esprits :**
- `SpiritAnimal` dispatcher → `PhoenixSpirit` (resilience) · `WolfSpirit` (sagesse) · `BearSpirit` (lumiere) · `DeerSpirit` (presence)
- Utilisé dans : `TransitionScreen` (size 40) · `PatronusReveal` (size 210) · `HomeScreen` ring (size 74)

**Quiz :**
- Tint overlay par archétype au moment de la sélection : gold/teal/indigo/rose à 10% opacité
- Ripple `choiceripple` (600ms) centré sur le bouton sélectionné — couleur de l'archétype du choix

**Main App — 4 onglets :**
- BottomNav étendu à 4 tabs : Accueil · Routines · Quêtes · Boutique
- `BoutiqueScreen` : ta collection archétype mise en avant + 3 autres en accordion · CTA → cava-brand.com

**Animations & Transitions (V1.7) :**
- `animalfloat` 18s : translateY(-7px) + scale(1.028) + translateX(3px) — remplace cerfdrift mécanique
- `animalbreathe` 22s : brightness 1→1.10 — sur PatronusReveal + TransitionScreen
- `tabslideIn` 220ms : translateX(10px→0) à chaque changement d'onglet + boutique stagger 80ms
- `forcespring` : overshoot à -4px sur les forces cards (ResultScreen), stagger 120ms
- Blackout coloré : overlay archétype 8% pendant les transitions d'écran
- `worldglow` : radial pulse centré, période monde-spécifique {feu:8s, foret:18s, brume:30s, eau:24s, cosmos:42s, vide:60s}
- `ringshimmer` 8s : glint conique rotatif sur le PresenceRing (HomeScreen)
- ResultScreen : scale(0.97→1) en plus de l'opacité sur chaque phase

**Transitions :** blackout 380ms teinté archétype + monde · grain SVG overlay 0.038 · Fade slide+delay

**Histoire silencieuse :**
- `localStorage['neya_history']` max 90 entrées {ts, color, texture, sound, world}
- Spirale Fibonacci · getDominantColor (4+ rituels, 3+ couleur) · getDominantWorld (5+ rituels, 3+ monde)

**V1.8 — nouveautés (sprints 15-22) :**
- HomeScreen : labels jours semaine (L/M/M/J/V/S/D) · "Jour X" · streak jours consécutifs · badge nav routines/quêtes
- Milestones : glow + `milestoneGlow` + motes particules sur jours 7/14/21/30/60/100
- Journée complète card quand toutes routines + ≥1 quête faites
- Intention card : accent bar · cycle ↻ persisté · indicateur ◎
- Stat cards cliquables → navigate tab · nextHint affiché sous la barre
- RoutinesScreen + QuetesScreen : CTA "Entrer en Présence" quand allDone
- TransitionScreen : animal de l'utilisateur (fix hardcode "presence")
- BottomNav : dot badge quand items incomplets
- BoutiqueScreen : année 2026, ring halo HomeScreen, will-change perf hints
- EspaceVrai : safe-area-inset-bottom · timing texte amélioré
- Quiz : re-sélection possible avant "Continuer"
- `getCurrentStreak()` : streak consécutif basé sur localStorage

**V1.9 — nouveautés (sprints 23-37) :**
- Sprints 23-24 : jourComplète boxShadow · stat card arrows · greetingStr 7 créneaux · RoutinesScreen flash allDone
- Sprint 25 : suppression Tailwind CDN inutile · fix manifest start_url + icon path
- Sprint 26 : `ReturningScreen` — micro-splash avec spirit animal (1.9s) avant MainApp · fix flash useState lazy init
- Sprints 27-29 : SplashScreen `ob0breathe 42s` + ghost DeerSpirit + colonne lumière · BgScreen `breatheAnim` prop · QuizScreen ambient archétype dominant · ResultScreen phase 2 routines preview
- Sprints 31-33 : EspaceVrai haptic [2,80,2] à 12s + patience texts archétype à 30s · QuizIntroScreen ghost WolfSpirit · `solbreathe 22s` sur "Tu n'es pas seul·e"
- Sprint 34 : fix flash returning user (useState lazy init depuis localStorage)
- Sprint 35 : ReturningScreen whisper time-aware (neya_visited) · "présences au total"
- Sprint 36 : EspaceVrai adieu time-aware (bonne nuit / journée / revenir) · IntroScreen `ob0breathe` · glow label EspaceVrai
- Sprint 37 : `PRESENCE_LABELS` archétype-spécifiques · whisper last-visit fix

### Assets dans `public/`
`cerf.svg` · `bg-onboarding.png` · `bg-brume.png` · `bg-foret.png` · `bg-cosmos.png` · `bg-feu.png` · `bg-eau.png` · `bg-vide.png` · `bg-vrai.png` · `bg-cosmos-alt.png`

**V2.0 — nouveautés (sprints 38-106) :**
- Sprint 62-64 : ReturningScreen salutation time-of-day · HomeScreen double-tap restart confirmation · EspaceVrai divider line pulse
- Sprint 65-67 : QuetesScreen allDone milestoneGlow · HomeScreen intention accent bar worldglow · Boutique header halo presencePulse
- Sprint 68-70 : BottomNav badge seedPulse · TransitionScreen divider worldglow · PatronusReveal CTA milestoneGlow
- Sprint 71-73 : EspaceVrai adieu solbreathe · QuizIntro CTA milestoneGlow · ResultScreen desc card accent bar
- Sprint 74-76 : HomeScreen stat cards allDone glow+icon · IntroScreen divider worldglow · ResultScreen force icons seedPulse stagger
- Sprint 77-79 : SplashScreen CTA milestoneGlow · EspaceVrai second intention phrasebreathe · BottomNav active radial glow
- Sprint 80-82 : Streak ≥7 milestoneGlow+✦ · ResultScreen final CTA milestoneGlow · QuizScreen continue milestoneGlow
- Sprint 83-85 : IntroScreen Poursuivre milestoneGlow · HomeScreen jourComplète CTA milestoneGlow · ResultScreen routines accent bar
- Sprint 86-88 : RoutinesScreen+QuetesScreen allDone CTAs milestoneGlow · BottomNav underline worldglow
- Sprint 89-91 : EspaceVrai 90s `DEEP_TEXTS` archétype · QuizIntro compass outer ring pulsering · RoutinesScreen done title textShadow
- Sprint 92-94 : Milestone "Jour X" milestoneGlow · Boutique tags stagger tabslideIn · EspaceVrai halo per-archetype size+intensity
- Sprint 95-97 : HomeScreen cycle↻ spin animation · PatronusReveal step4 outer glow ring · ResultScreen mini animal animalbreathe
- Sprint 98-100 : ReturningScreen worldInsight whisper · QuizScreen final progress bar glow · Boutique accordion slide tabslideIn
- Sprint 101-103 : QuetesScreen quest icons seedPulse · SplashScreen title phrasebreathe · ResultScreen worldInsight phrasebreathe
- Sprint 104-106 : HomeScreen profil phrasebreathe · Boutique footer phrasebreathe · TransitionScreen title phrasebreathe
- Sprint 107-109 : QuetesScreen Marquer accomplie milestoneGlow · HomeScreen "touche" placeholder phrasebreathe · RoutinesScreen header label phrasebreathe
- Sprint 110-112 : QuetesScreen header "◇ Quêtes" phrasebreathe · Boutique "Autres collections" separator phrasebreathe · RoutinesScreen h2 phrasebreathe
- Sprint 113-115 : ResultScreen forces divider worldglow · Boutique "Découvrir la collection" CTA milestoneGlow · ReturningScreen animal name phrasebreathe
- Sprint 116-118 : HomeScreen element phrasebreathe · QuetesScreen done checkmark milestoneGlow · RoutinesScreen allDone subtext phrasebreathe
- Sprint 119-121 : QuetesScreen allDone title milestoneGlow · Boutique "Chaque vêtement" phrasebreathe · HomeScreen presenceLabel phrasebreathe
- Sprint 122-124 : PatronusReveal "Ton animal guide" label phrasebreathe · PatronusReveal profil phrasebreathe · QuetesScreen allDone subtext phrasebreathe
- Sprint 125-127 : HomeScreen presences total phrasebreathe · IntroScreen screen1 body phrasebreathe · IntroScreen screen0 title phrasebreathe
- Sprint 128-130 : SplashScreen subtitle phrasebreathe · SplashScreen whisper time-aware phrasebreathe · ResultScreen forces h2 phrasebreathe
- Sprint 131-133 : QuizIntro footer phrasebreathe · ResultScreen intention label phrasebreathe · ResultScreen intention quote phrasebreathe

### Déploiement
- `vercel.json` configuré · `npm run build` → `dist/` fonctionnel
- Prod live : `https://neya-kappa.vercel.app` · Commit `e18a6d7`

### Backlog code
- [ ] Valider performance mobile (animations nombreuses — worldglow + ringshimmer + forcespring)
- [ ] Mettre à jour l'URL Boutique quand cava.fr est prêt (chercher `cava-brand.com` dans App.jsx)

### Actions Will (hors code)
- [ ] Valider visuellement les animaux-esprits sur mobile (phoenix / wolf / bear / deer)
- [ ] Valider haptic feedback sur iOS
- [ ] Mettre à jour l'URL Boutique quand cava.fr est prêt (chercher `cava-brand.com` dans App.jsx)
