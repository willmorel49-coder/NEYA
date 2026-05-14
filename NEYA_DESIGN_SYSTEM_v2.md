# NÉYA Design System v2

## Overview

NÉYA is a French-language emotional wellness app for adults 18-40 who experience emotional difficulty but don't typically seek help. It sits at the intersection of meditation app, narrative adventure game, and personal coach. The design system is **Studio VØR painterly cinematographic**: vectorial painterly illustrations composed in 7-plane parallax scenes, naturalistic dual palettes (Dawn for awakening, Night for rest), strong directional lighting, a tiny human silhouette before immense landscapes, and an animal totem inhabiting the scene — never overlaid.

The integrated brand **ÇA VA?** is a clothing capsule accessible from within NÉYA, with its own warm cream palette but inheriting NÉYA's typography.

**Reference benchmark**: Zak Steele-Eklund (Studio VØR) on Dribbble. If a scene could not plausibly be a frame from a Studio VØR project, it is not NÉYA.

**Core anchors (untranslated, brand assets)**:
- *« Et toi, ça va vraiment ? »*
- *« T'as pas besoin d'aller bien pour commencer. »*
- *« Tu n'es pas seul·e. »*
- *« Le lion blanc s'éveille avec toi. »*
- *« Pose-toi. Le daim veille. »*

---

## Colors

### Dawn Palette
- Void #050810 · Deep Night #0A0E1F · Night #1F2D52 · Twilight #3D4D85
- Lavender Warm #7B6FA8 · Peach Deep #D49880 · Amber #D4A878
- Peach Light #F4D4A8 · Light Diffuse #FBE8D8 · Cream #FBF6E8 · Tilleul #D4E08C

### Night Palette
- Shadow Purple #1F1535 · Deep Purple #3D2F6B · Mid Purple #5D4F8B
- Moon Blue #8FA4D4 · Lavender Lit #C3BEEF · Moon White #CADFFD
- Cream / Tilleul shared with Dawn

### ÇA VA?
- Bg Cream #F4F0E8 · Ink #1A1A1F · Warm #D49880 · Blue #5D7BB8 · Purple #3D2F6B · Tilleul shared

### Semantic (1.5px stroke or 30% glow only — never filled buttons)
- Success #8AB87A · Warning #D49880 · Crisis #C97171 · Info #8FA4D4

---

## Typography

- Display: **Fraunces** (variable, opsz 9-144) — hero/h1/h2 only
- UI: **Sora** — labels, buttons, marks
- Body: **Inter** — paragraphs

| Token | Family | Size | Weight | LH | LS | Usage |
|---|---|---|---|---|---|---|
| hero | Fraunces | 32 | 400 | 1.05 | -0.5px | Onboarding signature, crisis |
| h1 | Fraunces | 28 | 400 | 1.05 | -0.5px | Scene title |
| h2 | Fraunces | 22 | 400 | 1.10 | -0.3px | Section title |
| h3 | Sora | 18 | 500 | 1.20 | 0 | Card title |
| body | Inter | 14 | 400 | 1.55 | 0 | Body paragraph |
| body-sm | Inter | 12 | 400 | 1.50 | 0 | Secondary description |
| label | Sora | 11 | 500 | 1.30 | 0 | Button, tab, nav |
| mark | Sora | 9 | 500 | 1.00 | +2px | Chapter mark UPPERCASE |
| stat | Sora | 24 | 600 | 1.00 | -0.5px | Stat number |

**Rules** : italics on 2-4 emotional keywords in every Fraunces hero/h1/h2 (*vraiment*, *toi*, *avec toi*, *seul·e*, *veille*, *s'éveille*) via `<em>` with `font-style: italic; font-weight: 300`. Optical sizing on Fraunces 20px+: `font-variation-settings: "opsz" 144`. No bold (700+) except stat. No UPPERCASE except mark. Tutoiement always. Inclusive writing via middle dot ("seul·e").

---

## Spacing (base 4px)
sp-1 4 · sp-2 8 · sp-3 12 · sp-4 16 · sp-5 22 · sp-6 32 · sp-7 48 · sp-8 64 · sp-9 96

Screen padding: horizontal sp-5 (22px), bottom sp-6 (32px) above safe area, top sp-4 (16px).

## Radius
xs 4 · sm 8 · md 14 · lg 22 · xl 28 · pill 9999 · circle 50%

## Elevation (atmospheric, no drop shadows)
- halo-sm : 16px radial 25% (subtle totem presence)
- halo-md : 32px radial 35% (focused totem)
- halo-lg : 64px radial 45% (sun/moon source)
- mist-soft : horizontal gradient 0 → 0.18 → 0
- mist-strong : horizontal 0 → 0.35 → 0
- light-ray : triangular gradient from light source
- edge-lit : 0.5-1px stroke on subject edge facing light
- glass-blur : backdrop-filter blur(14px), rgba(world-accent, 0.08), 0.5px border rgba(world-accent, 0.2)

---

## Composition (non-negotiable)
1. **7+ parallax planes** per painterly scene
2. **Subject scale** : human silhouette 2-4% screen height · animal totem 5-8%
3. **Directional lighting** : ONE primary source, edge-lit on subjects facing, ground shadow ellipse
4. **Animal as inhabitant** : totem lives IN scene at natural place. For UI, use simplified line glyph (1.5px stroke, 24×24)
5. **Restrained typography** : hero text never > 35% scene height
6. **Naturalistic palette only** : no neon, no fluorescent, no fuchsia/electric/magenta

---

## Components

### Buttons (pill shape always)
- **Primary** : Cream fill, Deep Night text, Sora 500, halo-sm on hover. Sizes : sm 11/32/8×14 · md 12/40/10×18 · lg 14/48/12×24
- **Primary Night** : Moon White fill, Deep Night text, Night-palette only
- **Secondary** : transparent, Cream 80% text, 0.5px Cream 25% border
- **Ghost** : transparent, content-secondary text, no border
- **Icon-only** : 40px circular, Cream 8% fill, 0.5px Cream 18% border
- **Destructive (Crisis)** : Crisis 90% fill, Cream text — mode crise / account deletion only

### Cards
- **Default (solid)** : surface-scene bg, 0.5px Cream 12% border, radius-md, sp-4 padding — for non-painterly screens
- **Glass (overlay on painterly)** : backdrop-filter blur(14px), rgba(world-accent, 0.08), 0.5px rgba(world-accent, 0.2), radius-md, 12×14 padding
- **Editorial (magazine moment)** : rgba(cream, 0.55) + blur(20px), 0.5px rgba(cream, 0.7), radius-lg, 22×20 padding

### Inputs
surface-scene bg · 0.5px Cream 25% border · radius-md · 10×14 padding · Inter 14px content-primary · focus border world-accent 60% + halo-sm · error Crisis border + halo-sm Crisis

### Chips
- **Filter** : transparent, Cream 25% border, pill, 6×14, Sora 500 11. Active : world-accent 25% fill.
- **Status** : pill, Sora 500 11, 4×12. Complété (Success 20% / text), En cours (Tilleul 20% / text), À venir (Cream 15% / secondary), Verrouillé (Mid Purple 20% / tertiary), Crise apaisée (Moon Blue 20% / text)

### Lists
0.5px Cream 10% dividers · 14×0 padding · hover Cream 6% · active Cream 10% · leading 32px icon · trailing badge/glyph/chevron

### Chapter Mark
Sora 9px UPPERCASE +2px tracking. **Top-left** : brand "N É Y A" (non-breaking thin spaces) content-tertiary. **Top-right** : 2 lines — "CHAPITRE 0X" content-tertiary + world name content-secondary (Sora 500 9 no tracking).

### Hero Title
em-dash eyebrow "— L'ÉVEIL" content-accent + Fraunces 28 (h1) with `<em>italic keywords</em>` + Inter 11 content-secondary body 2 lines max.

### Glass Card variants
- **Action** : 12×14 padding, max 80 tall, icon + label + body-sm + trailing icon
- **Editorial** : 22×20 padding, mark + h2 + body

### Bottom Nav
backdrop-filter blur(20px), rgba(10,14,31, 0.85), 60px tall. 4 tabs : Aventure / Habitudes / Communauté / Profil. Center action ("Respirer"/"Méditer") 48px circular Tilleul fill Deep Night icon, raised -8px.

### Modal
surface-scene bg, 0.5px Cream 18% border, radius-lg, 24 padding. Backdrop rgba(5,8,16, 0.85) + blur(8). Slide-in bottom 400ms ease-out.

### Breathing Circle
Core meditation. 160px baseline, scale 1 → 1.4 → 1 over 19s (4s inhale, 7s hold, 8s exhale). Tilleul radial gradient 30% center → transparent, 0.5px Tilleul 60% border. Inner : phase label Sora 500 11 + remaining seconds in stat. 6-8 Tilleul dust particles drift outward during exhale.

---

## Worlds (6 emotional realms)

| # | World | Totem | Moment | Dominant | Light | Foreground |
|---|---|---|---|---|---|---|
| 01 | Forêt de la Clarté | Lion blanc | Dawn 5-8h | Amber | Right sunrise | Pine forest silhouette |
| 02 | Temple des Parts de Soi | Ours polaire | Cold morning 8-11h | Moon Blue | Above diffuse | Snowy plateau + dark temple |
| 03 | Oasis du Présent | Aigle céleste | Full day 12-14h | Peach Light | Zenith harsh | Sand dunes + oasis |
| 04 | Lac des Émotions | Daim lunaire | Night 22-2h | Lavender Lit | Upper right moon | Still alpine lake + moon reflection |
| 05 | Montagne de Vision | Baleine sage | Twilight 18-20h | Deep Purple | Left sunset | Mountain peak + distant sea |
| 06 | Espace Communautaire | Renard de l'aube | First light 4-5h | Peach Deep | Diffuse all | Misty ridge + fox silhouette |

---

## Screens

### Onboarding (5 immersive questions)
Each in a different world. Single page, no progress bar (chapter mark IS the progression).

| # | World | Mark | Hero | Response |
|---|---|---|---|---|
| 1 | Forêt | 01 — L'ÉVEIL | *« T'as pas besoin d'aller bien pour commencer. »* | 4 pills : "Pas terrible" / "Ça va, je gère" / "Plutôt bien" / "Je sais pas trop" |
| 2 | Temple | 02 — LE REFUGE | *« Qu'est-ce qui te ramène ici ? »* | 4 pills : "Le stress" / "Le sommeil" / "Les émotions" / "Curieux·se" |
| 3 | Oasis | 03 — LE TEMPS | *« Combien de minutes par jour ? »* | 4 pills : "5" / "10" / "15" / "Plus si je peux" |
| 4 | Lac | 04 — LE RYTHME | *« Quand préfères-tu te poser ? »* | 4 pills : "Matin" / "Midi" / "Soir" / "Avant de dormir" |
| 5 | Montagne | 05 — LA QUESTION | *« Et toi, ça va vraiment ? »* | 1 CTA : "Commencer mon aventure" |

Pills full-width 48 tall, glass cards stacked 8 gap. Tap : 200ms scale 1→0.96→1 + cross-fade 800ms to next world.

### Aventure (vertical ascent metaphor)
Girl silhouette sticky-centered. Valley (completed) → Forest/Lake (current) → Mountain peak (locked future).

UI : header "NÉYA" + "Jour 07 · 12 min" · girl 4% screen height with halo-md world accent · completed Cream-filled circles + Tilleul check · current 14px hollow Cream + halo-sm · locked 11px dashed Cream 30% · footer "Continuer la montée →" + "Carte".

### Habitudes
Top 40% painterly world preview, bottom 60% glass cards list. Each row : 24px totem glyph + Sora 500 14 title + Inter 12 subtitle + status chip.

### Méditation
Full painterly world bg + centered BreathingCircle + bottom row : Pause/Play (40 circle) · phase/timer (info) · Close X (40 circle). No skip. Anti-gamification.

### Communauté — Espace Vrai
Renard de l'aube scene scrolling parallax. Glass editorial cards 16 gap. Per post : pseudo Sora 500 11 + totem glyph 14 · time Sora 9 tertiary · body Fraunces 16 italic if <20 words else Inter 14 · reactions ❤️ 🤝 👀 Tabler outline + Sora 11 counter. No comments, no threads. Long-press : "Je suis touché·e par ça" → human moderator. Bottom CTA "Partager une voix ↑" full-screen composer 280 chars max, Tilleul submit.

### Profil
Lac des Émotions preview top 60% · glass card bottom 40% : pseudo (editable) · 3 stats horizontal (jours / minutes / mondes) · settings list · footer "Mode crise" Crisis ghost + "Déconnexion" ghost + version 9 tertiary. **No XP, no level, no flame streak.** Discrete reminder "Tu es revenu·e 7 jours d'affilée — c'est ce qui compte." Inter italic 12 secondary.

### Crise (4-screen)
Accessible 1 tap from anywhere (profile button · long-press 1.5s anywhere reveals SOS top-right · auto-trigger on crisis keywords).
1. **Reconnaissance** — Lac night scene, Daim 12% screen height, Fraunces 32 *« Tu n'es pas seul·e. »* + "Respire avec moi. Une minute." + ghost "Plus tard"
2. **Respiration** — BreathingCircle 90s, no close
3. **Choix** — 3 cards : "Parler à quelqu'un maintenant" (3115) / "Écrire ce que je ressens" (protected journal) / "Continuer de respirer"
4. **Sortie douce** — Fraunces 22 *« Tu peux revenir quand tu veux. Le daim veille. »* + "Retour à NÉYA"

Crisis data : **never** community, **never** personalization, minimum analytics (entry/exit timestamps safety audit only).

### Boutique ÇA VA?
Curtain reveal bottom 600ms. cava-bg full bleed. Header "ÇA VA?" Fraunces 24 italic cava-ink. Pass selector pill top-right. 3 capsules stacked (Libre warm · Ça Va blue · Vraiment? purple). Cards 4:5 image + Fraunces 16 title + striked price + new Sora 14 medium. No stars, no reviews, no sold count. Cart slide-in right. Passes : Libre free 0% · Ça Va 9.90€/yr 10% · Vraiment? 24.90€/yr 25%.

---

## Animations

### Easings
- ease-out : cubic-bezier(0.4, 0, 0.2, 1) (entries)
- ease-in-out : cubic-bezier(0.65, 0, 0.35, 1) (transformations)
- ease-narrative : cubic-bezier(0.25, 0.46, 0.45, 0.94) (slow transitions)

### Durations
- fast 200 · base 400 · slow 800 · narrative 1200 · cinematic 1500-2000

### Library
1. Gyroscope parallax (live, planes by 0.05...1.0)
2. Scroll parallax (live)
3. Breathing circle (19s loop)
4. Scene crossfade (800ms staggered 40ms)
5. ÇA VA? curtain (600ms)
6. Glass card mount (500ms + translateY 12→0)
7. Staggered CTA reveal (80ms each)
8. Totem idle pulse (4s scale 1↔1.05)
9. Sunrise transition (1500ms)
10. Light ray oscillation (8s opacity 0.3↔0.5)
11. Particle drift (12s)
12. Tilleul check pop (400ms scale 0→1.2→1)
13. Plongée transition (1000ms water plane rise)
14. Totem reveal (1200ms translateY + scale + halo)

### Forbidden
- Bounce / spring rebound on buttons or modals
- Rotation faster than 300ms
- Confetti (anti-gamification)
- Pulsing intense glow (max 0.4↔0.5 at 4s+)
- Shake notifications
- Skeuomorphic flips

---

## Iconography
Tabler Icons outline only · 1.5px stroke (1.2px <20) · 14/16/20/24/32/48 sizes · color inherit currentColor

### Totem glyphs (24×24, 1.5px stroke, monochrome)
- Lion : mane-haloed circle + eyes + nose triangle
- Ours : front head + rounded ears + snout
- Aigle : symmetric wings from above
- Daim : head + 3-prong antlers each side
- Baleine : side profile + water spout
- Renard : head + pointed ears + pointed snout

---

## Do's and Don'ts

### Do
1. 7+ parallax planes for every painterly hero
2. Human silhouette 2-4% / totem 5-8% screen height
3. One identifiable light source + edge-lit on subjects facing it
4. Italicized Fraunces on 2-4 emotional keywords in every hero title
5. Pair painterly with chapter mark top + restrained title bottom
6. Use Tilleul (#D4E08C) ONLY for vital presence (checkmarks, fireflies, present marker)
7. Crisis mode reachable in 1 tap from every screen
8. Glass cards ONLY when overlaid on painterly
9. Community reactions limited to ❤️ 🤝 👀 — no like counts, no rankings
10. Verify every screen against 6 composition principles before shipping

### Don't
11. No pure white #FFFFFF anywhere — always Cream #FBF6E8
12. No bright/neon/fluorescent — only naturalistic
13. No enlarged human silhouette — smallness IS the emotion
14. No painterly totems as floating UI — use line glyphs
15. No bounce or spring rebound
16. No Fraunces for body/buttons — emotional moments only
17. No vouvoiement — tutoiement non-negotiable
18. No streak flames, level numbers, XP bars
19. Crisis color rare — mode crise exit + account deletion only
20. No culpabilizing notifs ("Tu n'as pas médité depuis 3 jours") — invitation only ("Le daim t'attend")
21. No vertical mist gradient — always horizontal at horizon
22. No two halos at same intensity on same scene — one dominant

---

## Implementation tokens

See `src/tokens.css` — V2 exact + Apple mix supplements (iOS easings for snappy press, scale(0.95) data-press, SF Pro fallback in Sora/Inter stacks for system-native rendering on Apple devices).

---

## Reference checklist
- [ ] 7+ parallax planes
- [ ] Silhouette 2-4% / totem 5-8%
- [ ] One directional light source
- [ ] Edge-lit on subjects facing light
- [ ] Chapter mark top-left + top-right
- [ ] Fraunces hero + italic emotional keywords
- [ ] Body contrast ≥ 4.5:1
- [ ] Crisis 1 tap
- [ ] No gamification toxicity
- [ ] Tutoiement + inclusive (middle dot)
- [ ] No neon / fluorescent / pure-white
- [ ] Tilleul reserved for vital presence
- [ ] Glass cards only on painterly
- [ ] Transition defined (default crossfade 800ms)
- [ ] Tabler outline 1.5px only
- [ ] Buttons pill-shaped
- [ ] Animation respects forbidden list

---

**End of NÉYA Design System v2** — Studio VØR direction locked. Modifications require explicit v2.1 / v3 versioning.
