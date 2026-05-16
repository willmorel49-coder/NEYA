# CLAUDE.md — ÇA VA? · Directives VS Code
> Version 3.0 — Post-pivot · Palette définitive · Mai 2026
> Ce fichier fait autorité sur tout le reste. En cas de doute → Will.

---

## 1. IDENTITÉ

**ÇA VA?** est une seule marque : app de bien-être émotionnel gamifiée + marque de vêtements.
Le mot NÉYA n'existe plus. Remplacer toute occurrence dans le code.

**Audience** : Francophones 18–40 ans en difficulté émotionnelle qui ne cherchent pas d'aide traditionnelle.

**Ton** : adulte · poétique · éditorial · jamais clinique · jamais infantile · jamais wellness générique

**Copywriting anchor (intouchable)**
- "Et toi, ça va vraiment ?"
- "T'as pas besoin d'aller bien pour commencer."
- "Tu n'es pas seul·e."
- "La phrase la plus mensongère du monde."

**Gamification (NON-NÉGOCIABLE)**
- Récompenser la présence, pas la performance
- Aucun leaderboard
- Streaks pardonnables
- XP = témoin, pas compétition

---

## 2. PALETTE DE COULEURS — DÉFINITIVE

```css
:root {
  /* ── FONDS ── */
  --bg:             #EEF3F8;   /* fond principal — gris-bleu clair */
  --bg-card:        rgba(255,255,255,0.65); /* glass cards */
  --bg-dark:        #0A2438;   /* sections dark (hero boutique) */

  /* ── BLEUS (couleur dominante) ── */
  --blue-900:       #0A2438;   /* texte principal, dark bg */
  --blue-700:       #1A5A7F;   /* CTA primaire, accents forts */
  --blue-500:       #6F9DB5;   /* accents moyens, tags */
  --blue-300:       #C2D8E8;   /* bordures, icônes inactives */
  --blue-100:       #E8F2F8;   /* fonds légers */

  /* ── ROSES (couleur émotionnelle) ── */
  --rose-700:       #C87090;   /* CTA émotionnel, SOS, accents chauds */
  --rose-500:       #E8A0B8;   /* accents doux */
  --rose-300:       #F5C8D8;   /* blobs, fonds */
  --rose-100:       #FDE8F0;   /* fonds très légers */

  /* ── VIOLET (transition bleu↔rose) ── */
  --violet:         #7F5A8A;   /* pilier 03, accents intermédiaires */

  /* ── DÉGRADÉ SIGNATURE ── */
  --gradient-main:  linear-gradient(135deg, #1A5A7F, #7F5A8A, #C87090);
  --gradient-blue:  linear-gradient(135deg, #1A5A7F, #2A8ABF);
  --gradient-rose:  linear-gradient(135deg, #C87090, #E080A8);

  /* ── TEXTE ── */
  --text-primary:   #0A2438;
  --text-secondary: #4A6070;
  --text-muted:     #8AAABB;

  /* ── GLASS ── */
  --glass-bg:       rgba(255,255,255,0.65);
  --glass-border:   rgba(255,255,255,0.85);
  --glass-shadow:   0 4px 24px rgba(10,36,56,0.07);
  --glass-blur:     blur(24px);
}
```

---

## 3. TYPOGRAPHIE

```css
/* Google Fonts à importer */
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap');

/* Display / titres */
font-family: 'Cormorant Garamond', serif;
font-style: italic;
font-weight: 300;

/* UI / labels / corps */
font-family: 'Inter', sans-serif;
font-weight: 300 | 400 | 500 | 600;

/* Labels uppercase */
font-size: 9–11px;
letter-spacing: 0.18–0.22em;
text-transform: uppercase;
font-weight: 500;
```

**INTERDIT** : Inter comme font de titre · Arial · Roboto · System-ui en display

---

## 4. GLASSMORPHISM — RÈGLES

Toutes les cards et conteneurs utilisent le glassmorphism. Pas de fonds opaques blancs.

```css
.glass-card {
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.85);
  border-radius: 24px;
  box-shadow: 0 4px 24px rgba(10, 36, 56, 0.07);
}

/* Variante dark (sur fonds sombres) */
.glass-dark {
  background: rgba(10, 36, 56, 0.6);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

---

## 5. BLOBS DÉCORATIFS — RÈGLES

Les blobs remplacent les fonds unis. Ils donnent la profondeur sans prendre tout l'écran.

```css
/* Blob type rose */
.blob-rose {
  position: absolute;
  width: 260px; height: 260px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(200,112,144,0.20) 0%, transparent 70%);
  filter: blur(70px);
  pointer-events: none;
}

/* Blob type bleu */
.blob-blue {
  position: absolute;
  width: 220px; height: 220px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(26,90,127,0.18) 0%, transparent 70%);
  filter: blur(70px);
  pointer-events: none;
}
```

**Positionnement type par écran :**
- Aventure : blob rose top-right + blob bleu bottom-left
- Cocon : blob rose top-right + blob violet bottom-left
- Communauté : blob bleu top-left + blob rose bottom-right
- ÇA VA? boutique : blobs sur le hero dark uniquement

---

## 6. IMAGES DE FOND — RÈGLES D'UTILISATION

Les images illustratives (paysages, personnage) peuvent être utilisées mais :

- **JAMAIS plein écran complet** — toujours dans un conteneur délimité
- Format recommandé : carte arrondie 343×220px max (margin 16px chaque côté)
- Toujours avec `border-radius: 24px` et `overflow: hidden`
- Overlay gradient obligatoire pour lisibilité du texte
- L'image coexiste avec le fond glassmorphism — elle ne le remplace pas

```css
/* Conteneur image illustrative */
.illo-container {
  margin: 16px 16px 0;
  border-radius: 24px;
  overflow: hidden;
  height: 220px; /* max — jamais toute la hauteur d'écran */
  position: relative;
  flex-shrink: 0;
}

/* Overlay pour lisibilité */
.illo-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    transparent 30%,
    rgba(10,36,56,0.6) 100%
  );
}
```

---

## 7. COMPOSANTS UI

### Boutons
```css
/* Primaire — actions principales */
.btn-primary {
  background: linear-gradient(135deg, #1A5A7F, #2A8ABF);
  color: white;
  border: none;
  border-radius: 50px;
  padding: 15px 24px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  box-shadow: 0 8px 24px rgba(26,90,127,0.30);
}

/* Émotionnel — actions à valeur affective */
.btn-rose {
  background: linear-gradient(135deg, #C87090, #E080A8);
  box-shadow: 0 8px 24px rgba(200,112,144,0.30);
  /* même shape que btn-primary */
}

/* Outline — actions secondaires */
.btn-outline {
  background: transparent;
  border: 1.5px solid var(--blue-300);
  color: var(--blue-700);
  border-radius: 50px;
  padding: 13px 24px;
}

/* JAMAIS de bouton dark #0A2438 comme CTA positif */
```

### Cards piliers
```css
/* Chaque pilier = sa couleur */
.pilier-01 { /* Bleu */ accent: #1A5A7F; gradient: linear-gradient(135deg,#1A5A7F,#4A8AAF); }
.pilier-02 { /* Rose */ accent: #C87090; gradient: linear-gradient(135deg,#C87090,#E090B0); }
.pilier-03 { /* Violet */ accent: #7F5A8A; gradient: linear-gradient(135deg,#7F5A8A,#AF80BA); }

/* Barre accent gauche */
.pilier-card::before {
  content: '';
  position: absolute; left: 0; top: 0; bottom: 0;
  width: 3px;
  background: [gradient du pilier];
  border-radius: 0 2px 2px 0;
}
```

### Navbar
```css
.navbar {
  position: absolute;
  bottom: 12px; left: 14px; right: 14px;
  background: rgba(255,255,255,0.75);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.9);
  border-radius: 30px;
  padding: 12px 8px 10px;
  box-shadow: 0 8px 32px rgba(10,36,56,0.10);
}

/* Indicateur actif */
.nav-item.active::before {
  content: '';
  position: absolute; top: 0; left: 50%; transform: translateX(-50%);
  width: 18px; height: 2.5px;
  background: linear-gradient(90deg, #1A5A7F, #C87090);
  border-radius: 2px;
}
```

### SOS Button
```css
.sos {
  background: #C87090;
  color: white;
  font-size: 10px; font-weight: 600;
  letter-spacing: 0.1em;
  padding: 9px 18px;
  border-radius: 50px;
  border: none;
  box-shadow: 0 4px 16px rgba(200,112,144,0.35);
  position: fixed; top: 20px; right: 20px;
  z-index: 100;
}
```

---

## 8. PERSONNAGE — RÈGLES ABSOLUES

- Toujours vue **de dos** — JAMAIS le visage
- Cheveux **teal #12C4B0** — c'est sa signature
- Intégrée dans les cards illustratives (pas plein écran)
- Légère animation idle sur Cocon (balancement 6s, scale subtil)
- Halo teal diffus sous elle dans les scènes dark

```css
/* Halo personnage */
.char-halo {
  position: absolute;
  bottom: -10px; left: 50%;
  transform: translateX(-50%);
  width: 80px; height: 40px;
  background: radial-gradient(ellipse, rgba(18,196,176,0.3) 0%, transparent 70%);
  animation: halo 4s ease-in-out infinite;
}
@keyframes halo {
  0%,100% { opacity:0.5; transform:translateX(-50%) scale(1); }
  50%      { opacity:1;   transform:translateX(-50%) scale(1.15); }
}
```

---

## 9. STRUCTURE NAVIGATION

```
TAB 1 · L'AVENTURE  (↑)
├── Topbar (brand + SOS)
├── Illustration card 343×220 (personnage + paysage)   ← PAS plein écran
├── Texte hero (titre serif + sous-titre)
├── Glass card séance du jour (CTA bleu)
├── Section "Tes piliers" (label uppercase)
└── Liste piliers (01 bleu · 02 rose · 03 violet) + Bilan du soir

TAB 2 · LE COCON  (◇)
├── Topbar
├── Glass card hero (blob rose/bleu, lune, mantra)     ← PAS plein écran
├── CTA rose "Me poser 2 minutes"
└── Liste actions glass (Musique · Mantra · Personnaliser)

TAB 3 · COMMUNAUTÉ  (○)
├── Topbar
├── Glass card hero (silhouettes, "Tu n'es pas seul·e") ← PAS plein écran
├── Label "Les voix qui passent"
└── Feed voix (glass cards + réactions texte)

TAB 4 · ÇA VA?  (♡)
├── Hero dark avec blobs (ÇA VA? / tagline)            ← hero dark OK ici
├── Section collections (grid 2 col)
└── Message final + CTA dégradé

BOUTON SOS · fixed top-right · rose · toujours visible
```

---

## 10. PAGES RITUELS

```
Structure cible :
├── Header : "‹ Retour" + durée (ex: "8 MIN")
├── Titre serif italique grand
├── Sous-titre label uppercase (couleur du pilier)
├── Barre de progression : 2px, couleur pilier, en haut
├── Corps texte : Inter 300, line-height 1.75, #4A6070
├── Questions : glass cards avec border-left 3px couleur pilier
├── Textarea : glass, placeholder sans backslash
├── Citation finale : Cormorant italic centré, guillemets français « »
└── Bouton "TERMINER CE RITUEL" : CTA bleu (JAMAIS dark #0A2438)
    + "Reprendre plus tard" en texte sous le bouton
```

---

## 11. BUGS À CORRIGER EN PRIORITÉ

| # | Où | Problème | Fix |
|---|-----|----------|-----|
| 01 | Textarea rituels | `n\'est` avec backslash visible | Remplacer `\'` par `'` partout |
| 02 | Fin de rituels | Bouton "TERMINER" dark #1a1a2e | → CTA bleu gradient |
| 03 | Communauté | Question du jour affiche `« »` vide | État vide + question par défaut |
| 04 | Tous écrans | SOS chevauche le header | z-index + padding-right sur headers |
| 05 | Cocon | Personnage coupé à mi-corps | object-position: center 30% |
| 06 | Aventure | "Bilan du soir" sans style | Aligner visuellement avec les piliers |
| 07 | Partout | Occurrences "NÉYA" dans l'UI | Remplacer par "ÇA VA?" |

---

## 12. RÈGLES DE CODE

1. **Single-file** : composants < 300 lignes → un seul fichier
2. **Pas de dépendances superflues** — CSS natif d'abord
3. **SVG inline** pour icônes et personnage
4. **Safe areas iOS** : `env(safe-area-inset-bottom)` sur la navbar
5. **Images** : `width` + `height` + `object-fit: cover` toujours
6. **États vides** : toujours gérés proprement — jamais `« »` visible
7. **Apostrophes** : jamais de `\'` dans les strings JSX/HTML

**Nommage**
- Composants : PascalCase
- Hooks : camelCase + "use"
- Constants : SCREAMING_SNAKE

---

## 13. ROADMAP

### Phase 1 — Refonte palette & rebrand (MAINTENANT)
- [ ] Remplacer NÉYA → ÇA VA? partout
- [ ] Appliquer palette bleu/rose sur tous les écrans
- [ ] Glassmorphism sur toutes les cards
- [ ] Blobs décoratifs par écran
- [ ] Images dans des conteneurs délimités (pas plein écran)
- [ ] Corriger bugs 01 à 07

### Phase 2 — Expérience rituel
- [ ] Barre de progression couleur pilier
- [ ] Fade-in texte progressif
- [ ] Animation completion (pulse)
- [ ] Lumière dynamique selon l'heure

### Phase 3 — Communauté
- [ ] Feed avec réactions texte
- [ ] Cercle proche (7 max)
- [ ] Question du jour dynamique

### Phase 4 — Boutique éditoriale
- [ ] Chapitres émotionnels
- [ ] Citations au scroll

### Phase 5 — Production
- [ ] Auth Supabase
- [ ] Backend notes & progression
- [ ] Stripe / RevenueCat (9.90€ / 24.90€)
- [ ] Notifications push

---

## 14. INTERDITS ABSOLUS

1. Écrire "NÉYA" n'importe où
2. Fond blanc opaque sur les cards (→ glassmorphism)
3. Image plein écran qui couvre tout l'écran (→ conteneur délimité)
4. Bouton dark `#0A2438` comme CTA positif principal
5. Inter / Arial / Roboto en font de titre
6. Leaderboard ou mécanique compétitive
7. Ton clinique ("thérapie", "traitement", "diagnostic")
8. Montrer le visage du personnage
9. Laisser un état vide visible (`« »`, sections vides)
10. Safe areas iOS ignorées

---

## 15. RÉFÉRENCES TECHNIQUES

- App déployée : https://neya-kappa.vercel.app
- Stack prod cible : React Native + Expo · Supabase · API Anthropic · Stripe/RevenueCat · Mixpanel
- Fondateur : Will · Co-fondateur : Corentin Campion

