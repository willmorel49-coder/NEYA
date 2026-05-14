# NÉYA — Design System Manifest

## Overview

NÉYA's interface is a masterclass in **reverent emotional state portraiture framed by atmospheric darkness**. Every screen is a stack of edge-to-edge contemplative "tiles" — alternating dark surfaces of varying depth, each centered on a single intention: a poetic headline, a one-line whisper, a quiet archetype-tinted accent, and an emotional gesture (a Bilan, a Fragment, a Souvenir, a Souffle). Nothing competes with the inner state being held. Typography is generous but quiet; color is dark-first across four surfaces of cosmic depth; interactive elements are a single, archetypal cyan-or-archetype accent depending on context.

Density is unusually low even for contemplative apps. Each card occupies a discrete moment of presence, and there is no decorative chrome — no borders fighting for attention, no gradients shouting, no shadows on text. Elevation appears only when a halo of light rests beneath a sacred presence (a single soft `0 0 28px archetype/55` radial drop reserved for spirit animals and milestone moments). The result is an interior that feels more like a sanctuary at twilight than an app: the screen disappears and the emotional state takes the centre.

Home and Communauté retain the same chassis but switch volumes. The Communauté tab introduces Fragments éphémères — anonymous breath-bubbles arranged in an organic grid, each at `--r-card` (14px) radius with a glassmorphism filter, paired with a sticky ambient "N respirent en ce moment" header. The Espace Vrai modal leans into pure void, near-monastic. Across all five surfaces the typographic system, spacing rhythm, and the four emotional accents are consistent — this is one design language expressed at different emotional volumes.

**Key Characteristics:**
- Emotional-state-first presentation; UI recedes so the inner moment can be felt.
- Dark-first tile alternation: surface-void ↔ surface-base ↔ surface-raised ↔ surface-elevated — the depth gradient itself acts as the section divider.
- Four emotional accents (`--accent-spirit`, `--accent-sacred`, `--accent-introspection`, `--accent-grounding`) each tied to a narrative role. No generic "primary blue" — every accent carries an emotional state.
- Two button grammars: archetype pill CTAs (`--r-pill`) and quiet bordered ghost capsules (`--r-card`).
- Sora Display + Inter Text — negative letter-spacing at display sizes for the signature contemplative "NÉYA tight" headline feel.
- Whisper-soft light only where an emotional moment needs to breathe — `--light-inner` for active rituals, `--light-sacred` for animal totem reveals.
- Bottom navigation with a portal at its centre: four side tabs + one elevated lotus button (logo NÉYA) that opens the Cocon sanctuary.
- Section rhythm across multiple screens: greeting → contextual recommendation → mini-rituel → ton voyage — a quiet daily pulse, never an addictive loop.

---

## Colors

> **Source surfaces analyzed:** HomeScreen, PratiquesScreen, CommunauteScreen, VoyageScreen, ProfilScreen, BoutiqueScreen (ÇA VA?), EspaceVraiModal, BreathingModal, CoconScreen, SOSModal. The color system is identical across all interior surfaces; ÇA VA? introduces its own brand-extension layer.

### Brand & Accent

- **Spirit Cyan** (`--accent-spirit` — oklch(0.78 0.130 230) ≈ `#3AA8D8`): The signature emotional cyan, drawn from the heroine's blue hair in the founding mockups. Reserved for: ritual halos, presence ring on HomeScreen, ProfilScreen accents, Espace Vrai sacred glow, primary action CTAs when no archetype is contextually active. This is NÉYA's quiet but universal "you are seen here" signal.
- **Sacred Gold** (`--accent-sacred` — oklch(0.85 0.110 85) ≈ `#E8C16A`): The auréole of animal totems and milestone moments. Used for: WelcomeBack first paint, milestone celebrations (J3/J7/J14/J30/J60/J100), souvenir glow, the rare cherished state. Never a "highlight" — always a sacred threshold.
- **Introspection Lavender** (`--accent-introspection` — oklch(0.68 0.130 305) ≈ `#9F7AD4`): Paths inward, blooming wildflowers. Used for: Carnet écriture libre, Bilans (soir & semaine), retreats, quiet evening modules.
- **Grounding Emerald** (`--accent-grounding` — oklch(0.58 0.080 158) ≈ `#4A8B68`): Forest floor, roots, "you are here, now." Used for: validated Routines, Pratiques actives, état-souvenir "tu es là."

### Surface

- **Surface Void** (`--surface-void` — oklch(0.10 0.025 260) ≈ `#050810`): The deepest backdrop. Used for: Splash, transitions blackout, Quiz darkness, EspaceVraiModal core, video player frames, BoutiqueScreen Manifeste tile.
- **Surface Base** (`--surface-base` — oklch(0.14 0.030 258) ≈ `#0E1626`): The standard floor of every main screen. Slightly warmer than void, so the room feels lived-in. Used for: HomeScreen, PratiquesScreen, CommunauteScreen, VoyageScreen body.
- **Surface Raised** (`--surface-raised` — oklch(0.20 0.035 256) ≈ `#1A2438`): The card that floats. Used for: AujourdhuiCard, BilanCards, Mini-jeux selector card, Pratiques Routine/Quête cards, all glassmorphism modules with `backdropFilter: blur(10-14px)`.
- **Surface Elevated** (`--surface-elevated` — oklch(0.24 0.040 255) ≈ `#232E4A`): Modal elevation. Used for: PersonalizationModal, MusiqueModal sheet, MiniJeuxSelectorModal bottom-sheet, sheets with `backdropFilter: blur(20-22px)`.

### Text

- **Text Primary** (`--text-primary` — oklch(0.94 0.020 90) ≈ `#EFE9DC`): The voice that carries. Cream ivoire — never pure white. Used for: all headlines, body paragraphs, primary content. Contrast 18.5:1 on `--surface-base` (AAA).
- **Text Secondary** (`--text-secondary` — oklch(0.74 0.018 88) ≈ `#B8B0A0`): The voice that accompanies. Sub-titles, descriptions, metadata. Contrast 8.2:1 on `--surface-base` (AAA).
- **Text Whisper** (`--text-whisper` — oklch(0.56 0.015 86) ≈ `#84807A`): The murmur. Caps-spaced labels, hints, captions. Reserved for `letter-spacing: 0.22em` uppercase labels under 14px.
- **Text On Light** (`--text-on-light` — oklch(0.14 0.030 258) ≈ `#0E1626`): Text on saturated accent backgrounds (active CTA pill, spirit button). Always uses surface-base as the ink, preserving cosmic elegance.

### Hairlines & Borders

- **Border Veil** (`--border-veil` — `rgba(239, 233, 220, 0.10)`): Quasi-invisible card edges. Used for: main cards on `--surface-raised`. Suggests a bord rather than draws one.
- **Border Presence** (`--border-presence` — `rgba(239, 233, 220, 0.24)`): Visible edges signalling tappability. Used for: interactive cards, secondary buttons, sheets.

### ÇA VA? Brand Extension (Sister Maison)

Source: official moodboard 2026-05-14. Cohabits with NÉYA without fusion. `--cava-mist-blue` is the chromatic bridge between maisons.

- **Cava Terracotta** (`--cava-terracotta` — `#9F584E`): Passion, blood, life. Manifeste, broderies.
- **Cava Ochre** (`--cava-ochre` — `#C29051`): Mustard warmth, hand embroidery, signature hoodie.
- **Cava Emerald** (`--cava-emerald` — `#34917F`): Mode contemporaine, roots, interior fashion.
- **Cava Sage** (`--cava-sage` — `#9AAFA0`): Textile serenity, eucalyptus hoodie alternate surface.
- **Cava Cream** (`--cava-cream` — `#D4C8BA`): Textile ivoire — NOT the same as `--text-primary`. Warmer, more fabric.
- **Cava Mist Blue** (`--cava-mist-blue` — `#7397BC`): Powder blue — chromatic bridge to NÉYA's `--accent-spirit`, desaturated.

### Lumière (Light tokens — the real subject)

NÉYA is defined by light management, not by saturated color. Three light tokens encode all halos and atmospheric voiles.

- **Light Inner** (`--light-inner` — `rgba(58, 168, 216, 0.18)`): Inner halo. Applied as inset `box-shadow` or radial background on active surfaces (PresenceRing center, EspaceVrai breath ring, Crisis FAB). The surface "respire" from within.
- **Light Sacred** (`--light-sacred` — `rgba(232, 193, 106, 0.22)`): The sacred halo. Around spirit animals, WelcomeBack reveals, milestone celebrations. Threshold light, not decoration.
- **Light Veil** (`--light-veil` — `rgba(5, 8, 16, 0.55)`): The depth veil. Overlay applied on background images to guarantee text contrast. ~55% opacity, never 100%.

**No decorative gradients.** Atmospheric depth comes from cosmic photography (mountains, forest, mist, water, fire) inherent to the BgScreen imagery, not from CSS gradient stacking. The Cocon halos use radial backgrounds, but these are tokens (`--light-inner`), not freeform gradient overlays. NÉYA is the rare emotional app with disciplined light tokens.

---

## Typography

### Font Family

- **Display**: `Sora, system-ui, sans-serif` — humanistic contemplative sans, optimal at sizes ≥ 18px. Defines the voice of every ritual headline. Weight 300 dominant (the airy display weight).
- **Body / UI**: `Inter, system-ui, -apple-system, sans-serif` — text-optimized for body copy, captions, buttons, and labels below 18px.
- **Numeric**: `font-feature-settings: "tnum"` enabled on counters and timers (Bilan stats, Breathing countdown, weekDots) for tabular precision.

### ÇA VA? Display

- **Garet** (planned, brand extension) — used in BoutiqueScreen logo. Fallback Sora 500.
- **I Eat Crayons / Caveat** (planned, brand extension) — manuscript voice for citations and broderies. Cursive fallback.

### Hierarchy

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|
| `--text-display` | 34px | 300 | 1.20 | -0.015em | Hero greetings, ResultScreen archetype reveal |
| `--text-xl` | 26px | 300 | 1.20 | -0.015em | Section titles (Manifeste, Bilan headers) |
| `--text-lg` | 20px | 300 italic | 1.50 | 0.04em | Mantras, Espace Vrai intentions, sub-titles |
| `--text-base` | 16px | 400 | 1.50 | 0 | Default body, card titles |
| `--text-sm` | 13px | 300 italic | 1.65 | 0 | Whisper hints, fragment text, card descriptions |
| `--text-xs` | 11px | 500 | 1.40 | 0.22em | Labels caps (NÉYA signature), `text-transform: uppercase` |

### Principles

- **Negative letter-spacing at display sizes.** Every Sora headline at 18px and up carries `-0.005 → -0.020em` tracking tighten. Produces the NÉYA-tight contemplative cadence. Never below 16px.
- **Cream ivoire as the singular text color on dark.** No white (`#FFFFFF`) appears in text — anywhere. Cream `#EFE9DC` is the brand's reading voice. The extra warmth defines NÉYA's "twilight reading, not noon scanning" pace.
- **Weight 300 is the dominant Sora weight.** Used on 80% of display surfaces — Hero greeting, modal titles, Card titles. Weight 400 (Inter regular) is the body. Weight 500 (Inter medium) is reserved for labels and CTAs.
- **Italic is a register, not a stylistic flourish.** Sora 300 italic carries mantras, hints, secondary intentions. Inter 400 italic carries fragment text and ephemeral whispers. Italic always signals interior speech.
- **Letter-spacing 0.22em uppercase = brand label.** Every section label, every navigation tag, every category caps line uses 0.22em tracking. This is NÉYA's typographic signature, equivalent to Apple's "Available 9.19".
- **Line-height is context-specific.** Display 1.20 (tight, focused), body 1.50 (reading, paced), italic whispers 1.65 (relaxed, breathing). Never tight body, never loose display.
- **Weight 700 is deliberately absent.** The ladder is 300 / 400 / 500. Mid-saturation calls use weight 500, never weight 700. NÉYA refuses bold assertion.

### Note on Font Substitutes

Sora is open-source (Google Fonts). When unavailable:

- Use `Söhne` (commercial) for premium production, or `Manrope` (Google Fonts) as a closer humanistic Sora cousin.
- Tighten `letter-spacing` by an additional `-0.005em` when substituting Manrope; its default tracking runs slightly wider than Sora.
- Inter is replaceable by `Söhne` (premium), `Geist` (Vercel, free) for industrial contemporary feel — both pair beautifully with Sora.

---

## Layout

### Spacing System

- **Base unit:** 4px. Sub-base values (2, 3) are used for tight typographic adjustments; structural layout snaps to 4 / 8 / 12 / 14 / 16 / 18 / 22 / 24 / 32.
- **Tokens:** `--s-1` 4 · `--s-2` 8 · `--s-3` 12 · `--s-4` 16 · `--s-5` 24 · `--s-6` 32 · `--s-7` 48 · `--s-8` 72.
- **Screen padding:** `--s-5` (24px) horizontal on main scrollable screens (HomeScreen, CommunauteScreen). Reaches `--s-6` (32px) on contemplative modals (EspaceVraiModal, ProfilScreen).
- **Card padding:** 14-18px vertical, 16-22px horizontal. AujourdhuiCard, BilanCard at 18-22px both. Fragment bubbles at 12-14px for the tighter "bulle" geometry.
- **Section vertical padding:** `--s-7` (48px) between major HomeScreen sections; `--s-8` (72px) padding inside ritual modals (EspaceVraiModal, BoutiqueScreen Manifeste).
- **Button padding:** 12-14px vertical, 22-30px horizontal for primary pill CTAs.
- **Universal rhythm constants:** 1.50 line-height multiplier on body (~24px line at 16px), and 0.22em letter-spacing on caps labels — appear on every analyzed screen.

### Grid & Container

- **Max content width:** ~480px on contemplative screens (HomeScreen mobile-first), ~640px on Profil/Communauté scrollable lists, full-bleed for hero tiles and BoutiqueScreen tableaux.
- **Column patterns:** single-column stacked rituals on every interior screen; 2-column adaptive grid only in CommunauteScreen Fragments (auto-fill 120px minmax); no 3+ column dashboard grids anywhere.
- **Gutters:** 8-12px between Fragment bubbles in the grid (organic, not rigid).

### Whitespace Philosophy

NÉYA's whitespace is the silence around an inner moment. Every Hero begins with at least 56px of air above its greeting and 32px below the avatar. Cards never touch their siblings — minimum `--s-3` (12px) gap between two stacked cards, `--s-4` (16px) between two sections. The footer is the only area where density is intentional — the SOS link and the "Refaire" link sit tight, because reaching them is meant to feel like a quiet last resort, not a featured action.

---

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| Flat | No shadow, no border | Full-bleed tiles, BgScreen, footer, body sections |
| Soft veil | 1px `--border-veil` border | Main cards on `--surface-raised`, sheets, modules |
| Presence | 1px `--border-presence` border | Interactive cards (Mini-jeux selector, ProfilSectionCard) |
| Backdrop blur | `backdrop-filter: blur(N)` over `--surface-raised`/`--surface-elevated` | BottomNav, sub-nav sticky bars, all modals |
| Inner halo | `box-shadow: 0 0 28px var(--light-inner) inset` | Active PresenceRing, breath ring centers, Crisis FAB |
| Sacred halo | `box-shadow: 0 0 28px var(--light-sacred)` | Spirit animals, WelcomeBack, milestone moments |

**Shadow philosophy.** NÉYA uses **exactly two** atmospheric halos, both archetype/role-tied, both reserved for emotional states — never for cards, never for buttons, never for text. Elevation in the UI comes from (a) surface-color depth gradient (void → base → raised → elevated) and (b) backdrop-blur on sticky chrome. The two halos are about giving the moment weight, not about UI hierarchy.

### Decorative Depth

- **Cosmic photography** on BgScreen (forest/cosmos/mist/fire/water/void) supplies mood; no CSS gradient involved.
- **Surface depth alternation** creates rhythm without borders or shadows — the depth shift itself is the divider.
- **Backdrop-filter blur** on BottomNav and ritual modals creates a "floating over content" effect that's functional, not decorative.

---

## Shapes

### Border Radius Scale

| Token | Value | Use |
|---|---|---|
| `--r-none` | 0px | Full-bleed BgScreen, hero tiles (no corner rounding) |
| `--r-xs` | 4px | Progress bars, fine bars, inline pills (rare) |
| `--r-sm` | 8px | Compact utility chips, small badges |
| `--r-card` | 14px | Main cards (AujourdhuiCard, Mini-jeux, ProfilSectionCard) |
| `--r-lg` | 18px | Modal containers, BilanCards, large feature blocks |
| `--r-xl` | 22-26px | Sheet top corners (MusiqueModal, MiniJeuxSelector bottom-sheets) |
| `--r-pill` | 9999px | Primary CTAs, ghost CTAs, search inputs, sub-nav buttons — the signature NÉYA pill |
| `--r-full` | 9999px / 50% | Circular avatar (spirit animal), bottom-nav central button (lotus), FAB |

### Photography Geometry

- **Hero imagery (BgScreen):** full-bleed, 9:16 vertical on the splash and onboarding cosmos backgrounds; 21:9 on quiz transitions. Backgrounds are matte-painted illustrations (Studio Ghibli + Aesop + cosmic dawn), never photo-realistic product shots.
- **Spirit animal images:** PNG/AVIF with circular crop, rest on a `--surface-raised` tile and pick up `--light-sacred`.
- **Avatar in Hero:** 44px circle of spirit-${archetype}.avif with `object-position: center 45%`, `--light-inner` halo, opens ProfilScreen on tap.
- **No rounded imagery in hero tiles** — BgScreen backgrounds are full-bleed rectangular. Rounding (`--r-sm`, `--r-card`) appears only on inline card imagery.
- Lazy-loading via responsive `srcset` and AVIF/WebP CDN-optimized.

---

## Components

### Navigation

**`global-nav`** — None. NÉYA has no top global navigation bar. The visual top of every screen is the Hero (HomeScreen) or the screen title (PratiquesScreen, CommunauteScreen). Removing the persistent top bar is deliberate: it gives the cosmos room to breathe and removes the SaaS-app feeling.

**`bottom-nav-portal`** — The persistent navigation at the foot of every interior screen. Background gradient `rgba(5,8,16,0.62) → rgba(5,8,16,0.94)`, `backdrop-filter: blur(22px)`, height ~62px + safe-area-inset-bottom. Four side tabs in `--text-whisper` (10px / 500 / 0.10em uppercase, becomes `--accent-spirit` when active) + **one elevated central portal**: a 62px circle holding the lotus logo NÉYA, raised `-22px` above the bar, with radial halo background and `animalbreathe` 9s ambient pulse. Tap on the lotus = opens CoconScreen sanctuary. The portal IS the home base, the quiet centre of the cosmos.

**`sub-nav-tabs`** — CommunauteScreen and PratiquesScreen carry an inline 2-3 tab row, no glassmorphism, just typographic underlines. Active tab: 1.5px `--accent-spirit` border-bottom. Inactive: 1px `rgba(239,233,220,0.06)` border-bottom. Tabs in Sora 14 / 300 (active in cream, inactive in `--text-whisper`).

### Buttons

**`button-primary-pill`** — The signature NÉYA action. Background gradient `linear-gradient(135deg, archetype 0.88, archetype 0.62)`, text cream `#EFE9DC` in Inter 12 / 400, `letter-spacing: 0.22em`, `text-transform: uppercase`, rounded `--r-pill` (full pill), padding 14px × 30px, `minHeight: 48px`. `box-shadow: 0 6px 24px archetype/40` — the gentle press signal. Active state: implicit `transform: scale(0.97)` via data-press global handler.

**`button-ghost-pill`** — Used as the secondary CTA. Background `transparent`, text cream, 1px solid `rgba(239,233,220,0.18)` border, rounded `--r-pill`, padding 13px × 0 (full-width). Reads as a "quiet refusal" or "later" path.

**`button-archetype-soft`** — The third CTA family. Background `rgba(archetype, 0.18)`, text cream, 1px `rgba(archetype, 0.55)` border, rounded `--r-pill`, padding 13px × 32px. Used for confirmations within rituals (e.g., "Border la journée ☾" on BilanDuSoir).

**`button-icon-circular`** — Floats over photography or sits in the Hero corner. 36-38px diameter, background `rgba(8,12,22,0.42)` with archetype-tinted border, icon in cream, rounded `--r-full`. Used for Hero utilities (⚙ ↗ ✎), modal close buttons (✕), Crisis FAB (✿).

**`crisis-fab`** — The rarest button. 40px circle, background `rgba(255,180,140,0.10)` papillon-amber tone, border `rgba(255,180,140,0.36)`, rounded `--r-full`, position `fixed; right: 14; bottom: safe+84`, z-index 95. `box-shadow: 0 4px 18px rgba(255,180,140,0.14), 0 0 24px rgba(255,180,140,0.08)`. Animation: `signaturePulse 8s + fadeIn 2.2s`. Appears conditionally: mood ≤2 within 24h OR nocturnal pattern post-absence ≥7d. Never red, never medical, never anxiogenic — a reassuring silent presence.

**`text-link-anchor`** — Inline anchor links in cream + subtle archetype-glow textShadow. Used for the SOS footer ("Si ça ne va pas du tout"), CAVA-BRAND.COM link in BoutiqueScreen coda. Underlined 1px archetype/55.

### Cards & Containers

**`card-presence`** — The default contemplative card. Background `--surface-raised` (#1A2438) with `backdropFilter: blur(10-14px)`, `border-veil` edge, rounded `--r-card` (14px), padding 16-22px. Stack: caps label (`--text-xs`) → headline (`--text-base/lg`) → italic hint (`--text-sm`) → optional CTA. Used for AujourdhuiCard, MiniJeuxSelector card, ProfilSectionCard, Pratiques cards.

**`card-bilan`** — Specialized expanded card for evening/weekly reflections. Background gradient `--surface-raised` + light archetype tint, `border-presence` edge, rounded `--r-lg` (18px), padding 18-22px. Conditionally rendered on HomeScreen (h≥20 OR Sunday h≥18). Tap-to-expand mechanic: collapsed = 5-7 lines, expanded = full reflection with stats lines.

**`card-fragment`** — The breath bubble in CommunauteScreen Fragments. Variable size 110-126px (organic), background `radial-gradient(rgba(archetype,0.14), rgba(archetype,0.04), transparent)`, `border-presence` archetype edge, rounded `--r-card`. Animation: `splashmote 22-30s` (float gentle) + cascade `fadeIn 0.5s`. Tap to reveal: morphs from glyph ◯ to revealed italic fragment text.

**`card-sanctuary-item`** — The five item cards in CoconScreen (Bougie, Cristal, Plante, Totem, Portail). Grid 2×2 + 1 full-width. Background `rgba(archetype, 0.10-0.16)` when unlocked, `rgba(255,255,255,0.04)` when locked. Item icon SVG 28px with `drop-shadow archetype`. Title in Sora 13 / 300. Status text caps "Touche pour placer" or "✦ Dans ton cocon".

**`tile-editorial`** — BoutiqueScreen full-bleed editorial section. Background `--surface-void`, content centered, height 90-100vh, `scrollSnapAlign: start`. Stack: caps label "— Tableau I —" / Roman numeral top-right → photographic hero centered → italic phrase bottom-left, max-width 280px. No shadows, no borders. The depth of the cosmos IS the divider.

**`manifesto-tile`** — Dedicated BoutiqueScreen tile for the ÇA VA? mission statement. Background `--surface-void` absolute, centered text, 85vh height. "Nous existons pour briser le masque du « ça va »." headline in Sora 26 / 300, terracotta accent on the quoted phrase. Single 32px horizontal divider in `--cava-terracotta`. Sub-line italic.

**`floating-sticky-bar`** — Reserved (currently unused). Specification: floats at bottom on long scroll sequences. Background `--surface-elevated` 80% with `backdrop-filter: blur(20px)`, height 64px. Contains: contextual reminder + primary action. Not deployed; reserved for future "Continue your ritual" patterns.

### Inputs & Forms

**`text-input-pill`** — Used in PersonalizationModal, CarnetModal, FragmentsView. Background `rgba(archetype, 0.06-0.10)`, text cream, 1px `rgba(archetype, 0.32-0.40)` border, rounded `--r-card` (14px). Padding 14-16px × 16-18px. Letter-spacing `-0.005em`. Font Sora 14-16 / 300. No placeholder shadow; placeholder text in `--text-whisper`.

**`textarea-fragment`** — Specialized textarea in FragmentsView composition. Width 100%, minHeight 110px, background `rgba(archetype, 0.10)`, 1px archetype border, rounded `--r-card`, font Sora 16 / 300, lineHeight 1.55, max-length 80 with live counter "0/80 · anonyme · 24h". `resize: none`.

**`search-input-pill`** — Reserved. Specification: rounded `--r-pill`, leading icon search glyph at 14px in `--text-whisper`. Not deployed yet; CommunauteScreen Fragments uses long-press composition gesture rather than search.

Error and validation states are not surfaced in the analyzed screens (V1 has no form validation flow — all inputs are intimate writing zones with optional submit).

### Footer

NÉYA has no traditional footer. The bottom of HomeScreen carries: "Refaire le parcours" link (Inter 11.5 / 300, `--text-whisper`) and "Si ça ne va pas du tout ✿" Crisis link (Sora 12 / 300 italic, papillon-amber tint). Both deliberately quiet — reaching them feels like a quiet last resort, not a featured area.

BoutiqueScreen carries its own coda: caps signature "ÇA VA ? — MMXXVI" in Inter 9 / 400 / 0.38em tracking, in `--cava-pierre` (or NÉYA `--text-whisper`).

---

## Do's and Don'ts

### Do

- Use `--accent-spirit` (Spirit Cyan) for default interactive elements when no archetype context is present — onboarding, CommunauteScreen, ProfilScreen, generic CTAs. The four emotional accents are non-interchangeable.
- Set headlines in `--text-display` or `--text-xl` with negative letter-spacing (`-0.015em → -0.020em`) to get the signature "NÉYA tight" contemplative cadence.
- Run body copy at `--text-base` (16px / 400 / 1.50 / 0em). Never 14px (caps territory) or 18px (only display).
- Alternate surface depth (`--surface-base` → `--surface-raised` → `--surface-elevated`) for tile rhythm. The depth gradient IS the divider.
- Reserve `--r-pill` for primary CTAs, search inputs, sub-nav action buttons, and any element that should read as "an action you're taking."
- Apply `--light-inner` and `--light-sacred` halos only on emotional moments (PresenceRing centre, spirit animal reveals, breathing ring core). Never on cards, never on buttons, never on text.
- Use `transform: scale(0.97)` (via `data-press` global handler) as the active/press state on every button — the universal micro-interaction.
- Keep the BottomNav central portal (lotus logo) as the singular path to Cocon — the home base of the sanctuary.
- Place the anchor "Et toi, ça va vraiment ?" / "T'as pas besoin d'aller bien pour commencer" / "Tu n'es pas seul·e" at exactly five strategic points per major version. Never more, never randomly.

### Don't

- Don't introduce a fifth accent color. The four emotional accents (spirit/sacred/introspection/grounding) are the complete chromatic vocabulary. New mood → reuse, don't expand.
- Don't add shadows to cards, buttons, or text — shadow exists only for sacred halos.
- Don't use gradients as decorative backgrounds; atmospheric depth comes from BgScreen photography or surface depth alternation.
- Don't set body copy at weight 500 or 700 — NÉYA's ladder is 300 / 400 / 500. Body is always 400; strong inline is 500; display is 300.
- Don't use pure `#FFFFFF` (white) text anywhere — `--text-primary` (cream ivoire #EFE9DC) is the only acceptable "white" in NÉYA's vocabulary.
- Don't round full-bleed tiles in BoutiqueScreen — they're rectangular and edge-to-edge; the surface change is the divider.
- Don't tighten line-height below 1.50 for body copy — the editorial leading is part of the brand's reading pace.
- Don't mix radii grammars — use `--r-sm` (8px) for compact utility, `--r-card` (14px) for default cards, `--r-lg` (18px) for modals, `--r-pill` for pills. Nothing in between.
- Don't use clinical or competitive vocabulary anywhere in copy. Forbidden words: "performance", "objectif", "score", "XP", "système nerveux", "cortisol", "parasympathique". See `glossaire` in MIGRATION_LOG.md.
- Don't pluralize gendered French defaults without `·e` inclusive notation. Always "seul·e", "revenu·e", "fier·e".

---

## Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
|---|---|---|
| Small phone | ≤ 360px | Hero typo drops to 28px; cards padding tightens to 14-16px; FragmentsView grid stays auto-fill but minmax drops to 100px |
| Phone (default) | 361-480px | Single-column stacked layout, all main screens optimized at this width. PWA primary target. |
| Large phone | 481-640px | Cards reach max-width 460px and center; FragmentsView grid switches to 3 columns from 2; padding stays |
| Tablet portrait | 641-833px | Hero greeting unchanged; ProfilScreen sections widen to max 480px; BoutiqueScreen tableaux become slightly portrait-cropped |
| Tablet landscape | 834-1023px | Mostly unchanged — NÉYA is mobile-first; tablet rendering keeps mobile narrow column on 50% screen, dark padding on sides |
| Small desktop | 1024-1280px | App container locks at 480px max width centered; sides reveal `--surface-void` ambient cosmos backdrop |
| Desktop | ≥ 1281px | Same lock; cosmic backdrop expands; 2x desktop-only easter egg planned (split contemplation companion) |

The structural breakpoints that matter: 480px (default mobile target), 833px (tablet portrait switch), 1024px (desktop lock activation).

### Touch Targets

- Minimum 44 × 44px. `button-primary-pill` lands at ~48 × 200px (with the full-pill radius making the hit area generous).
- `button-icon-circular` is 36-38px — slightly under the iOS recommendation, compensated by `data-press` global handler which expands the tap zone via padding inheritance.
- BottomNav portal central button is 62 × 62px — generously larger to communicate "you can always come home."
- CrisisFab is 40 × 40px — kept smaller than 44 to remain visually quiet; expanded via padding-inherit on the parent.

### Collapsing Strategy

- **BottomNav portal:** unchanged across breakpoints. The 62px central button stays elevated `-22px` on all viewports.
- **Hero greeting:** `--text-display` (34px) drops to 28px at ≤ 360px; mantra italic stays at `--text-lg`; avatar spirit stays 44px.
- **Pratiques sub-tabs:** 2 tabs flex 1:1 at all widths.
- **CommunauteScreen Fragments grid:** `grid-template-columns: repeat(auto-fill, minmax(120px, 1fr))` — adapts from 2 to 4 columns naturally.
- **BoutiqueScreen tableaux:** scroll-snap mandatory on phone, scroll-snap proximity on tablet+. Full-bleed always.
- **ProfilScreen sections:** stack always, max-width 440px centered, padding always `--s-5` (24px) horizontal.

### Image Behavior

- All BgScreen photography uses responsive `srcset` with breakpoint-matched crops (AVIF primary, WebP fallback).
- Spirit animal images: AVIF 200×200 source, served at 44/64/96/120/200/240 across contexts.
- Cosmic starfields are CSS-generated via radial-gradients (no asset weight) at the Hero level.
- BoutiqueScreen tableaux: 4:5 portrait photography, full-bleed, no responsive art-direction switch (the editorial composition is held across viewports).
- Lazy-loading default; above-fold Hero AVIFs preloaded via `<link rel="preload">` in `index.html`.

---

## Iteration Guide

1. Focus on ONE component at a time. Reference its name directly (`card-presence`, `button-primary-pill`, `crisis-fab`).
2. Variants of an existing component (`-active`, `-focus`, `-archetype-x`) live as separate entries in the components catalog.
3. Use `var(--*)` tokens everywhere in inline styles — never inline hex (except in legacy not-yet-migrated sections, documented in `MIGRATION_LOG.md`).
4. Never document hover. Default and Active/Pressed states only — NÉYA is mobile-first, hover is not a primary input modality.
5. Display headlines stay Sora 300 with negative letter-spacing. Body stays Inter 400 at 16px. The boundary is unbreakable.
6. The two atmospheric halos (`--light-inner`, `--light-sacred`) are reserved for sacred emotional moments only — PresenceRing, spirit animals, milestones, ritual centres. Never decorate cards.
7. When in doubt about emphasis: alternate surface depth (`--surface-base` → `--surface-raised`) before adding chrome.
8. When in doubt about copy tone: read the source aloud. If it sounds like a SaaS notification, rewrite. If it sounds like a friend at twilight, ship.
9. Crisis Mode is the singular non-negotiable: any new screen must allow reaching SOS in < 2 seconds via the long-press logo gesture. Test this on every PR.

---

## Known Gaps

- Form validation and error states are not surfaced in the analyzed screens; only the neutral textarea-fragment and text-input-pill are documented. Future Carnet/PersonalizationModal error states need an `--state-tender` ambient warning treatment (papillon-amber, not red).
- The MusiqueModal's audio progress visualization (waveform, scrubber) uses a platform-default HTMLAudioElement track. NÉYA-tokenized waveform component is reserved for V2.
- BoutiqueScreen ÇA VA? membership tiers ("Passage / Présence / Cercle Intime") are documented narratively in `UX_AUDIT_REPORT.md` but not yet implemented as components.
- Dark-mode counterparts are NOT planned — NÉYA is dark-native by design. The ÇA VA? Boutique operates in `--surface-void` with `--cava-cream` text accents; a fully cream-canvas inverted mode would be required for any "light mode" exploration, deliberately out of scope.
- Atmospheric photography (cosmic backdrops, spirit animal imagery) is a content asset, not a design token. The documented `tile-editorial` and `card-sanctuary-item` describe the structural surface; the rotating photographic content varies by archetype and is curated separately.
- The exact `backdrop-filter` blur radius across `bottom-nav-portal`, ritual modals, and sticky chrome is platform-dependent; production CSS uses `blur(20-22px)` baseline with `saturate(140%)` reserved for future iteration.
- Internationalization beyond French: NÉYA's anchor copywriting ("Et toi, ça va vraiment ?", "T'as pas besoin d'aller bien pour commencer", "Tu n'es pas seul·e") loses its poetic register in direct translation. English / Spanish / Italian launches require dedicated copy-tuning, not localization.
- Long-press gesture timing (600ms for Crisis Mode on logo) is calibrated for desktop and modern phones; older Android touch latency may shift the perceived dwell. Reserved for accessibility audit V1.1.

---

**End of Manifest — NÉYA Design System v1**
*Generated 2026-05-14 · Living document · See `MIGRATION_LOG.md` for migration progress.*
