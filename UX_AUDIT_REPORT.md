# NÉYA — UX_AUDIT_REPORT

> Synthèse orchestrateur des 5 agents UX (IA Navigation · Lisibilité · Regroupement · Narratif · Frontend Design). Phase 3 du brief.

---

## 1. Score global UX actuel : **60 / 100**

| Agent | Domaine | Score | Pondération |
|---|---|---|---|
| 1 | IA & Navigation | 58 | 1.2 |
| 2 | Lisibilité & Hiérarchie | 58 | 1.1 |
| 3 | Regroupement & Charge cognitive | 52 | 1.2 |
| 4 | Cohérence narrative & Ton | 68 | 1.1 |
| 5 | Frontend Design (skill officiel) | 62 | 1.0 |

**Moyenne pondérée** : 59.4 → **60/100**

### Diagnostic global

NÉYA a **les ingrédients d'un produit 90+** : onboarding cinématique abouti, ResultScreen/EspaceVrai au niveau couture, palette + animaux spirituels + 6 mondes cohérents, BoutiqueScreen éditoriale référence. Mais la **MainApp post-onboarding s'effondre** à ~50/100 — le rêve s'aplatit en dashboard générique. Trois faiblesses critiques :

1. **Architecture floue** : 4 onglets déséquilibrés (Home porte 70% de la charge), pas d'onglet Profil/Communauté alors que les fonctions existent en modaux orphelins.
2. **Densité non-hiérarchisée** : 36 tailles typo distinctes + 440 animations infinies = murmure indifférencié. Tout pulse → plus rien ne tranche.
3. **Crisis Mode caché** : SOS uniquement en footer HomeScreen — violation du brief "main tendue <2s psychologiques".

L'app **fait bien NÉYA dans l'onboarding** ; elle **fait moins NÉYA** une fois entrée.

---

## 2. Top 10 problèmes P0 (consolidés)

| # | Problème | File:line | Agent | Impact |
|---|---|---|---|---|
| 1 | **Crisis SOS planqué** (1 entrée footer Home, inaccessible depuis modaux plein-écran) | `App.jsx:4955-4963` | A1+A4 | Vital |
| 2 | **Onglet Communauté absent** (Lettres+Cercle+Invite+Pulse éparpillés en 4 modaux) | `App.jsx:7604,7879,8013,7586` | A1+A3 | Identité produit |
| 3 | **Onglet Profil absent** (Settings+Personalize+Trace+Souvenirs+Share en orphelins) | `App.jsx:8064,4216,8287,6494,8391` | A1+A3 | Récit identitaire |
| 4 | **TraceScreen orphelin** (composant existant jamais monté dans la nav) | `App.jsx:8287` | A1 | Feature morte |
| 5 | **36 tailles typo distinctes** (vs 6-8 max design system mature) | `App.jsx:*` (1019 occurrences fontSize) | A2 | Hiérarchie cassée |
| 6 | **Texte alpha 33-55% sur image bg** (contraste WCAG ≈1.4:1, fail catastrophique) | `App.jsx:4614,2488,2495` | A2 | Lisibilité |
| 7 | **BreathingModal jargon clinique** ("Navy SEALs", "parasympathique", "cortisol") | `App.jsx:3915-3941` | A4 | Casse le ton |
| 8 | **440 animations infinies** (anti-pattern frontend-design absolu : "bruit > silence") | `App.jsx:*` | A5+A2 | Bruit visuel |
| 9 | **EspaceVrai 9 paragraphes empilés** (rituel sacré devient murmure indifférencié) | `App.jsx:2460-2510` | A2+A4 | Densité rituel |
| 10 | **Espace Vrai sans couche communautaire douce** (rituel solo seul, manque "quelqu'un ressent ça aussi") | `App.jsx:2331` | A3 | Brief Will |

---

## 3. Conflits inter-agents tranchés

### Conflit 1 — Nombre d'onglets : 4 ou 5 ?
- **A1** : 4 onglets (home/pratiques/voyage/ensemble) + Profil via tap silhouette Hero. Boutique disparaît.
- **A3** : 5 onglets (home/pratiques/communaute/boutique/profil), Voyage devient section Home.

**Décision orchestrateur** : **4 onglets + Profil immersif via tap avatar Hero**.
**Justification** :
- 5 onglets dans une BottomNav iOS = densité tappable cassée (chaque onglet < 75px sur iPhone SE)
- Brief Will exige Boutique conservée (éditorial couture, commerce invisible)
- Voyage reste un onglet car c'est un univers narratif distinct (6 mondes), pas une section
- Profil accessible via geste premium (tap silhouette Hero = "entrer chez soi") = plus poétique qu'un onglet

**Mapping final** :
```
Bottom Nav (4) :
├── Accueil       — HomeScreen (hub vivant, présence du jour)
├── Pratiques     — PratiquesScreen (Routines + Quêtes en sub-tabs)
├── Communauté    — NEW (Fragments éphémères + Lettres + Cercle + Pulse)
└── Boutique      — BoutiqueScreen éditoriale couture (+ Capsules invisibles)

Profil (immersif) :
└── Tap avatar Hero header → ProfilScreen plein écran
    └── Identité · Trace 30j · Souvenirs · Persona archétype · Réglages · Partager
```

### Conflit 2 — Crisis Mode : FAB ou long-press logo ?
- **A1** : FAB SOS persistant + long-press logo (cumul)
- **A3** : long-press logo header uniquement

**Décision orchestrateur** : **Long-press logo NÉYA primaire + FAB conditionnel intelligent**.
**Justification** :
- Long-press logo (600ms) = geste premium, invisible-mais-toujours-là, déjà cohérent (le logo est partout)
- FAB permanent = pollue la composition silencieuse de l'app
- **MAIS** : FAB **conditionnel** apparaît si signaux détresse détectés (mood ≤2 sur 24h, ou 3+ ouvertures rapprochées Carnet en mode crise, ou inactivité ≥7j puis ouverture nocturne) → vraiment intelligent + invisible quand pas besoin

### Conflit 3 — Typo : Inter ou Söhne ?
- **A5** : remplacer Inter (327 occurrences AI-slop) par Söhne + introduire PP Editorial New
- Brief Will : "Sora (display) + Inter (body)" établi

**Décision orchestrateur** : **Sora + Inter conservés. Introduire PP Editorial New en accent display rare uniquement.**
**Justification** :
- 327 occurrences Inter → remplacement = chantier 4-6h, hors scope V1
- PP Editorial New en accent (3-5 endroits stratégiques : dates filigrane, titres écran-clé, ÇA VA? Manifeste) = signature distinctive sans casser la base
- Söhne reportable à V2 si confirmé en production

### Conflit 4 — TraceScreen : Voyage ou Profil ?
- **A1** : Voyage > sous-tab "Constellation"
- **A3** : Profil > "Trace 30j"

**Décision orchestrateur** : **Profil > Trace 30j**.
**Justification** : Voyage = univers narratif des MONDES (espace). Trace = TON parcours dans le temps (constellation personnelle). Logique : Voyage = où, Profil = quand.

### Conflit 5 — Espace Vrai : enrichir ou laisser sacré ?
- **A3** : ajouter couche communautaire (Fragments anonymes éphémères)
- **A4** : sacralité rituelle à préserver, manque animal spirituel

**Décision orchestrateur** : **Préserver le rituel solo + ajouter Fragments dans onglet Communauté (séparés)**.
**Justification** :
- EspaceVraiModal reste un rituel sacré 90s solo (intact)
- La couche communautaire Fragments devient un **espace distinct dans Communauté** (sous-tab dédié)
- Pas de fusion = pas de pollution du sacré
- Animal spirituel ajouté DANS EspaceVrai après long-press summary (cohérent agent 4)

---

## 4. Plan de refonte priorisé — 3 vagues

### **Vague 1 — Architecture & Crisis (P0 vital)** · 4-6h

Objectif : **rendre l'app lisible cognitivement en 15s** + **crisis mode <2s partout**.

1. **Crisis Mode multi-couches** (`App.jsx:1236`, `4955`, global)
   - Long-press logo NÉYA 600ms = ouverture SOSModal (logo partout = SOS partout)
   - FAB SOS conditionnel : apparaît si mood ≤2 sur 24h OR inactivité ≥7j + ouverture 22h-4h
   - Conserver bouton footer Home pour découverte initiale
2. **Onglet Communauté nouveau** (`App.jsx:3856` BottomNav)
   - Remplace l'ancien onglet structure
   - 4 sous-tabs : Fragments (NEW éphémères 24h) · Lumières (Cercle) · Lettres · Pulse
   - Anti-patterns bloqués : pas de like, follow, leaderboard, reply
3. **Onglet Profil immersif** (`App.jsx:8884` App routing)
   - Accessible via tap avatar silhouette Hero (geste premium "entrer chez soi")
   - Contient : Identité (Personalize) · Trace 30j (TraceScreen ré-activé) · Souvenirs · Persona · Réglages · Partager
4. **Migrations modaux** : LettresInconnusModal+CercleDePresenceModal+InviteFriendModal → Communauté. PersonalizationModal+SettingsScreen+ShareArchetype+TraceScreen+SouvenirsGalleryModal → Profil.
5. **MainApp routing** : ajouter `screen === 'profil'` au niveau App.

### **Vague 2 — Lisibilité & Narration (P0 important)** · 3-5h

Objectif : **hiérarchie typographique propre + ton NÉYA respecté partout**.

6. **Échelle typo canonique** (App.jsx global)
   - 9 tokens : display1-4 (Sora) + body1-3 (Inter) + label + micro
   - Interdire valeurs demi-points (8.5, 9.5, etc.)
   - Réduction 36 → 9 tailles distinctes
7. **Refonte copy clinique** (`App.jsx:3915-3941, 6012, 2780, 7491-7567`)
   - BreathingModal : remplacer "Navy SEALs/parasympathique/cortisol" par copy poétique-épique
   - ConcentrationZen : pareil
   - MiniJeuxSelectorModal : "thérapeutiques" → "gestes intérieurs"
   - SOSModal headlines : 7 phrases-clés agent 4 (verbatim)
8. **Anchors marque placés** (5 endroits stratégiques) :
   - HomeScreen returningMsg j1 → "Et toi, ça va vraiment ?"
   - WelcomeBackOverlay → "T'as pas besoin d'aller bien pour revenir"
   - BilanDuSoir intro → "Et toi, ça va vraiment ce soir ?"
   - AujourdhuiCard hour<6 → "Tu n'es pas seul·e dans cette nuit"
   - EspaceVrai DEEP_TEXTS variante → "Et toi, là, ça va vraiment ?"
9. **Animaux spirituels** aux 5 moments-pivots manquants :
   - EspaceVrai après long-press summary
   - WelcomeBackOverlay first paint
   - SOSModal close → "{Animal} reste avec toi."
   - WorldUnlockModal pré-nom monde
   - BilanDuSoirCard/BilanSemaineCard headers
10. **Contraste fixes** (`App.jsx:4614, 2488, 2495`)
    - `${arch.color}33` sur image → wrapper voile `rgba(5,8,16,0.55)` OR alpha 42+
11. **7 empty states** designés (Cocon vide, Souvenirs vide, Carnet premier jour, Lettres aucune reçue, Jardin j0, Error, Offline) — copy + glyph fantôme
12. **EspaceVrai allégé** : 9 paragraphes empilés → 1 paragraphe principal + RotatingWhisper (single-slot crossfade)
13. **XP/niveau masqués UI** : conserver mécanique interne, retirer affichage chiffre (toast "+25 XP" → souvenir nommé)

### **Vague 3 — Frontend Design premium (P1 raffinement)** · 4-6h

Objectif : **distinctivité éditoriale anti-AI-slop + finition couture**.

14. **Motion purge** : 440 → 12 animations infinies
    - Garder uniquement 10 cas high-impact (modalEnter, tabslideIn, bgbreathe Quiz, choiceripple, milestoneGlow conditionnel, animalbreathe Hero+Transition, signaturePulse labels rituels, splashmote MainApp ÷2, worldglow BgScreen actif, phrasebreathe h1 uniquement)
    - Convertir en one-shot orchestrated : ResultScreen forces stagger 80ms, PatronusReveal séquence 3 phases, BreathingModal intro 1.4s séquencée
14b. **Capsules narratives ÇA VA?** + **Le Cercle 3 tiers**
    - Injecter `prix` + `dispo` dans CAVA_TABLEAUX
    - Cartel Sora 10px "Capsule I" sur chaque Tableau
    - Bouton ✦ flottant invisible (opacity 0.42 vide / 0.92 plein)
    - Section "Le Cercle" insérée avant Coda : Passage 0€ · Présence 12€ · Cercle Intime 38€
15. **PP Editorial New** en accent display
    - Dates filigrane fond Hero (clamp 72-130px opacity 0.04)
    - Titre Manifeste ÇA VA?
    - Titres écran-clé (BreathingModal name, EspaceVrai "Espace de présence")
16. **Grain SVG global** overlay `feTurbulence baseFrequency 0.9 opacity 0.06 mix-blend overlay`
17. **PratiquesScreen sub-tabs refondues** (`App.jsx:8643`)
    - Supprimer glassmorphism cards → 2 onglets typographiques séparés par ligne verticale gold 1px
    - PP Editorial New italic 22px (inactif) / normal (actif) avec underline animé gold
18. **BreathingModal intro orchestrée 1.4s** (séquence stagger trait or → titre TypingText → chiffres romains → CTA)
19. **Custom cursor** sur Boutique (desktop : 16px outline, grandit 48px sur tap-targets, point gold sur CTAs rituels)
20. **Dramatic shadow signature** : remplacer génériques par dual-layer factorisée (CSS var --shadow-soft / --shadow-glow)
21. **Design tokens CSS** (:root) : espacements 4-8-12-16-24-32-48-72 + radius 2/8/18/pill/circle + shadows

---

## 5. Bénéfices estimés

| Vague | Score gains | Effort |
|---|---|---|
| Vague 1 | 60 → 72 | 4-6h |
| Vague 2 | 72 → 82 | 3-5h |
| Vague 3 | 82 → 91 | 4-6h |

**Cible V1 : 90/100** — produit qui se distingue clairement après 15s d'usage, identité narrative + DA éditoriale fusionnées, mécaniques addictives invisibles.

---

## 6. Risques

- **Migrations modaux** : 3 modaux (Lettres, Cercle, Invite) déplacés = risque casse imports et état localStorage. Mitiger : tester chaque modal après migration, conserver les setState dans HomeScreen comme fallback temporaire.
- **TraceScreen** : non testé en intégration onglet, peut casser le layout. Tester avec données vides J0.
- **EspaceVrai allégement** : si on retire 5 paragraphes, on perd la profondeur 90s. Mitiger : RotatingWhisper crossfade conserve la matière textuelle, change juste la mécanique d'affichage (single-slot vs empilement).
- **Crisis Mode FAB conditionnel** : algorithme détection trop sensible = pollution permanente. Mitiger : seuils stricts (mood ≤2 sur 3 jours OR pattern nocturne réel), pas de détection naïve.
- **PP Editorial New** : font hosting Fontshare = dépendance externe. Mitiger : self-host woff2 ou fallback gracieux Sora italic.

---

## 7. Ce qui resterait à améliorer en V2

- Söhne body (remplacement Inter 327 occurrences) — chantier 1 sprint
- Spatialisation 3D audio (PannerNode sur visiteurs Cocon)
- Backend réel Communauté Fragments (Vercel KV + modération)
- Push notifications poétiques opt-in 1/sem
- Pass abonnement Cercle Intime — paiement Stripe one-time
- Sound Garden mini-jeu compositionnel
- Routine customization (replace 1 routine par custom)

---

**Validation requise par Will avant exécution Vague 1.**
