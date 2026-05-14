# NÉYA — UX_MAP

> Cartographie complète de `src/App.jsx` (9 059 lignes, 111 fonctions, mono-fichier React) — préalable à l'audit 5 agents.

---

## 1. Flow racine (`export default function App()` L8884-9059)

État `screen` orchestre 8 vues principales en cascade :

```
splash → intro → quiz-intro → quiz → world-reveal → transition → result → main
                                                                            ↑
                                                                  returning (utilisateur récurrent)
                                                                            ↑
                                                                  WelcomeBackOverlay (≥3j)
```

Transitions : fonction `go(nextScreen, fn)` avec blackout 360ms teinté archétype.

**Persistance** : `localStorage.neya_profile = { archetype, savedAt }` détermine `splash` vs `returning` au mount.

---

## 2. Vues d'onboarding (avant `main`)

| Écran | Composant (line) | Rôle | Sortie |
|---|---|---|---|
| Splash | `SplashScreen` (1425) | Bienvenue · Grand Voyage · CTA "Commencer" | → intro |
| Intro | `IntroScreen` (1500) | 3 écrans cinématiques (palier émotionnel) | → quiz-intro |
| Quiz Intro | `QuizIntroScreen` (1581) | "Prêt·e pour ton exploration ?" 23 questions | → quiz |
| Quiz | `QuizScreen` (1669) | 23 questions à choix multiples, ambient archétype-tinted, progress | → world-reveal |
| World Reveal | `WorldRevealBridge` (1879) | Cerf qui apparaît, transition révélation | → transition |
| Transition | `TransitionScreen` (1922) | Effet spirit animal SVG anim | → result |
| Result | `ResultScreen` (2165) | Archétype révélé · profil · animal · forces · CTA "Entrer" | → main |
| Returning | `ReturningScreen` (1296) | Micro-splash 1.9s pour returning user | → main |

---

## 3. MainApp (`MainApp` L8701) — Navigation principale 4 onglets

```
BottomNav (4 onglets) :
├── home       → HomeScreen (4329)         — Accueil hub
├── pratiques  → PratiquesScreen (8643)    — Sous-tabs Routines + Quêtes
├── voyage     → GrandVoyageScreen (3758)  — 6 mondes débloqués
└── boutique   → BoutiqueScreen (5268)     — ÇA VA? éditorial couture
```

État supplémentaire : `vraiOpen` → `EspaceVraiModal` (rituel sacré 90s), `pendingWorldUnlock` → `WorldUnlockModal`, `milestoneCount` → `MilestoneCelebration`, `xpToast`.

---

## 4. HomeScreen — Architecture complète (L4329-4969)

Sections affichées en cascade (post Vague-1+fusions) :

```
┌─ NeyaHeroSection (silhouette femme cheveux bleus + cosmos + greeting time-aware)
├─ World ambient layer (motes archétype-spécifiques)
├─ Cocon items ambiance (5 items placés)
├─ Header secondaire (profil archétype + presenceLabel)
├─ PresenceRing 130px (tap → EspaceVrai)
├─ Bilan dimanche≥18h OU Bilan soir≥20h (conditionnel)
├─ InvitationCard
├─ AujourdhuiCard (quick mood + outil recommandé contextuel)
│
├── SECTION "Mini-jeux doux" (1 card sélecteur → MiniJeuxSelectorModal)
│   └─ ouvre Libération | Apaisement | Concentration | Réparation
│
├── SECTION "Tes espaces"
│   ├─ Carnet du Voyage
│   └─ Mon Cocon Néya
│
├── SECTION "Lien aux autres"
│   └─ Lettres à un·e inconnu·e
│
├── SECTION "Ton voyage"
│   ├─ Prochaine découverte (monde à débloquer)
│   ├─ Streak + weekDots + totalDone
│   ├─ Aujourd'hui Routines+Quêtes (tabs cards → 'pratiques')
│   └─ "Journée complète" jourComplète → "Entrer en Présence" CTA
│
└── Footer
    ├─ "Refaire le parcours" (retake quiz)
    └─ "Si ça ne va pas du tout" → SOSModal
```

**Total clickables HomeScreen** : ~16-18 zones tappables actuelles (post-fusion).

---

## 5. Inventaire complet des modaux (28 modaux/overlays)

### Modaux principaux (rituels/contenus)
| Modal (line) | Contexte | Profondeur |
|---|---|---|
| `BreathingModal` (3908) | Exercice respiration archétype 4 techniques (Guerrier/Ancrage/Cohérence/Créateur) | Plein écran |
| `EspaceVraiModal` (2331) | Rituel sacré 90s, halo per-archetype, long-press summary | Plein écran |
| `CoconScreen` (3132) | Sanctuaire personnel : 5 items placés, jardin embed, musique embed | Plein écran zIndex 800 |
| `CarnetModal` (7791) | Écriture quotidienne 200char + mood quick | Modal centré |
| `LettresInconnusModal` (7604) | Lettres anonymes : recevoir/envoyer | Plein écran |
| `JardinModal` (5352) | Jardin intérieur croissance | Plein écran |
| `SOSModal` (7416) | Ressources urgence + ancres personnelles | Plein écran |

### Mini-jeux thérapeutiques (4)
| Modal (line) | Axe |
|---|---|
| `LiberationPenseesModal` (6261) | Cognitif (défusion ACT) |
| `ApaisementSensorielModal` (6092) | Corporel (grounding 12 dots) |
| `ConcentrationZenModal` (5844) | Attentionnel (SART 60s) |
| `ReparationCoconModal` (5615) | Reconstructif (drag 6 fragments) |

### Espaces secondaires
| Modal (line) | Rôle |
|---|---|
| `MusiqueModal` (2838) | Playlist 11 tracks Will (depuis Cocon) |
| `MiniJeuxSelectorModal` (2670) | Sélecteur 4 mini-jeux (depuis Home) |
| `VisualisationGuideeModal` (7281) | Rituel onboarding 60s |
| `SouvenirsGalleryModal` (6494) | Galerie souvenirs gagnés |
| `SouvenirDetailModal` (2539) | Détail d'un souvenir tappé |
| `CoconItemDetailModal` (3050) | Sens symbolique item Cocon |
| `TraceScreen` (8287) | Constellation 30 jours (orphelin actuellement) |
| `BilanDuSoirCard` (6708) | Bilan quotidien auto h≥20 |
| `BilanSemaineCard` (6844) | Bilan hebdo dim h≥18 |

### Sociaux
| Modal (line) | Rôle |
|---|---|
| `CercleDePresenceModal` (7879) | Lumières envoyées aux proches |
| `InviteFriendModal` (8013) | Inviter un·e proche |
| `PulseCollectif` (7586) | Compteur ambient archétype-tinted |

### Système
| Modal (line) | Rôle |
|---|---|
| `SettingsScreen` (8064) | Réglages / restart / retake quiz |
| `PersonalizationModal` (4216) | Prénom + mantra + nomCocon + 2 toggles audio |
| `ShareArchetype` (8391) | Partager profil archétype |
| `RoutineGuideModal` (4970) | Détail routine |
| `QuetesGuideModal` (8235) | Détail quête |
| `WorldUnlockModal` (3591) | Célébration déblocage monde |
| `MilestoneCelebration` (8601) | Célébration J3/J7/J14/J30/J60/J100 |
| `WelcomeBackOverlay` (6445) | Retour ≥3j |
| `WorldDetailOverlay` (3698) | Détail monde |

---

## 6. Composants UI atomiques

- `NeyaLogo` (1236) — lotus + wordmark
- `NeyaPortrait` (7160) — femme cheveux bleus pour NeyaPresenceCard
- `WomanSilhouette` (7016) — silhouette de dos pour Hero
- `NeyaGirl` (2519) — fille hub cocon
- `BgScreen` (1261) — wrapper background + overlay
- `PresenceRing` (1277) — anneau de présence animé
- `TypingText` (849) — typewriter effect
- `GrainFilter` (874) — grain CSS
- `MoodSlider` (3886) — slider humeur 5 niveaux
- `MoodGraph` (7753) — graphique mood 14j
- `HomeSection` (6435) — séparateur titre section
- `FadeOnScroll` (5250) — IntersectionObserver pour CA VA?
- `ChoiceIcon` (1657) — picto quiz
- 4 NavIcon (Home/Routines/Quetes/Boutique/Voyage)
- `InvitationCard` (4305) — invitation du jour
- `AujourdhuiCard` (6583) — mood quick + reco contextuelle
- `BilanDuSoirCard` / `BilanSemaineCard` — rituels temporels
- `NeyaHeroSection` (7067) — hero accueil signature mockup
- `NeyaPresenceCard` (7210) — carte personnage NÉYA incarné
- `ConsentToast` (8840) — RGPD consent
- `InstallPromptButton` (8857) — PWA install

---

## 7. Helpers / logique (~40 fonctions)

Domaines :
- **Identité** : `computeArchetype`, `loadProfile/saveProfile`, `getPresenceLabel`, `getPresenceProgress`
- **Progression** : `getCurrentStreak`, `getTotalRoutinesDone`, `getTotalDaysVisited`, `getWeekDots`, `getXP`, `addXP`, `getLevelIndex`, `getLevelName`, `getXPProgress`, `getXPToNext`
- **Voyage** : `getUnlockedWorlds`, `getWorldFragmentCount`, `getWorldRealFragmentCount`, `addEvraiFragment`, `getDaysToNextWorld`
- **Routines/Quêtes** : `loadRoutines/saveRoutines`, `loadQuetes/saveQuetes`
- **Invitation** : `getTodayInvitation`, `isTodayInvitationDone`, `completeTodayInvitation`
- **Grace** : `getGraceAvailable`, `applyGraceIfNeeded` (streak indulgent)
- **Visites** : `markTodayVisited`, `isTodayFirstVisit`, `daysSince`
- **Date** : `todayKey`, `greetingStr`, `getDailyIntention`
- **Audio** : helpers UI feedback
- Utility : `haptic`

Externes (autres fichiers) :
- `src/inner-world.js` — souvenirs, jardin, cercle, carnet, mood, bilan, welcome-back (~30 helpers)
- `src/community.js` — letters (40 seed, getNext, send, getCollective)
- `src/audio.js` — 10 sons procéduraux + drone Cocon + 11 MP3 ambient + lecteur playlist
- `src/motion.js` — easings + initPressFeedback + useExitAnimation + streak milestone
- `src/analytics.js` — Posthog Cloud EU lazy-loaded

---

## 8. Stats codebase

| Métrique | Valeur |
|---|---|
| Lignes `App.jsx` | 9 059 |
| Composants `function` | 111 |
| Modaux/overlays distincts | ~28 |
| States `useState` (App seul) | ~50+ |
| Animations infinites | 440 |
| Onglets bottom nav | 4 (home/pratiques/voyage/boutique) |
| Sections HomeScreen | 4 (Mini-jeux / Tes espaces / Lien aux autres / Ton voyage) |
| Mini-jeux thérapeutiques | 4 axes (cognitif/corporel/attentionnel/reconstructif) |
| Mondes émotionnels | 6 (brume/feu/foret/cosmos/eau/vide) |
| Archétypes | 4 (résilience/présence/sagesse/lumière) |
| MP3 tracks Will | 11 |
| Souvenirs library | 35+ types |

---

## 9. Profondeur de navigation — Calcul des taps clés

| Action | Taps depuis Home | Évaluation |
|---|---|---|
| Démarrer une respiration | 2 (AujourdhuiCard reco si mood activé) ou 3 (Pratiques fade-in) | Variable |
| Démarrer un mini-jeu | 2 (Mini-jeux doux card → option) | OK |
| Accéder à l'Espace Vrai | 1 (PresenceRing tap) | Excellent |
| Voir badges/souvenirs | 2 (Cocon → cards items placés) ou TraceScreen orphelin | À fixer |
| Acheter vêtement | 2 (Boutique tab → CTA externe coda) | OK pour philosophy |
| SOS (crisis) | 2 (Home → footer bouton) | À monter en visibilité |
| Carnet | 1 (Home → "Tes espaces" → Carnet card) | OK |
| Personnaliser | 2 (Hero buttons ⚙ ✎ ↗) | OK |
| Lettres anonymes | 2 (Home → "Lien aux autres") | OK |

---

## 10. Identité produit à préserver (rappel du brief)

- **Palette** : `#050810` fond · indigo `#6366f1` · magenta `#ec4899` · teal `#14b8a6` · gold `#f59e0b`
- **Typo** : Sora (display) + Inter (body)
- **Ton** : adulte · poétique · épique · jamais clinique
- **Anti-patterns** : pas de leaderboard, pas de comparaison, pas de réseau social, streaks indulgents (grace days)
- **Univers narratif** : 6 mondes émotionnels + 6 animaux spirituels (Phénix/Cerf/Loup/Ours/Aigle/Papillon) + silhouette féminine cheveux bleus de dos
- **Anchors copy** : *"Et toi, ça va vraiment ?"* · *"T'as pas besoin d'aller bien pour commencer"* · *"Tu n'es pas seul.e"*

---

## 11. Crisis mode (SOS)

Accessibilité : **bouton "Si ça ne va pas du tout"** en footer de HomeScreen uniquement. Pas d'accès depuis les autres onglets actuellement. **Recommandation potentielle agents** : monter SOS en footer toutes vues OU long-press sur logo central.

---

**End UX_MAP** — prêt pour la Phase 2 (lancement des 5 agents) sur validation.
