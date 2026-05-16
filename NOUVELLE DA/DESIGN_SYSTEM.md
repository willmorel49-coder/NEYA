# DESIGN SYSTEM — ÇA VA?
> Référence rapide pour le développement. Voir CLAUDE.md pour le détail complet.

## COULEURS
| Token | Hex | Usage |
|-------|-----|-------|
| --bg | #EEF3F8 | Fond principal app |
| --blue-900 | #0A2438 | Texte principal, dark bg |
| --blue-700 | #1A5A7F | CTA primaire, accents |
| --blue-500 | #6F9DB5 | Tags, accents moyens |
| --blue-300 | #C2D8E8 | Bordures, inactif |
| --rose-700 | #C87090 | CTA émotionnel, SOS |
| --rose-500 | #E8A0B8 | Accents doux |
| --violet | #7F5A8A | Pilier 03 |

## FONTS
- Titres : Cormorant Garamond italic 300
- UI : Inter 300/400/500/600

## COMPOSANTS RAPIDES

### Glass card
```css
background: rgba(255,255,255,0.65);
backdrop-filter: blur(24px);
border: 1px solid rgba(255,255,255,0.85);
border-radius: 24px;
box-shadow: 0 4px 24px rgba(10,36,56,0.07);
```

### Blob rose
```css
border-radius:50%; filter:blur(70px);
background: radial-gradient(circle, rgba(200,112,144,0.20), transparent 70%);
```

### Blob bleu
```css
border-radius:50%; filter:blur(70px);
background: radial-gradient(circle, rgba(26,90,127,0.18), transparent 70%);
```

### CTA bleu
```css
background: linear-gradient(135deg, #1A5A7F, #2A8ABF);
box-shadow: 0 8px 24px rgba(26,90,127,0.30);
border-radius: 50px; padding: 15px;
```

### CTA rose
```css
background: linear-gradient(135deg, #C87090, #E080A8);
box-shadow: 0 8px 24px rgba(200,112,144,0.30);
border-radius: 50px; padding: 15px;
```

### Dégradé signature
```css
background: linear-gradient(135deg, #1A5A7F, #7F5A8A, #C87090);
```

## IMAGES DE FOND
- Toujours dans un conteneur : `border-radius:24px; overflow:hidden; max-height:220px`
- Overlay obligatoire : `linear-gradient(to bottom, transparent 30%, rgba(10,36,56,0.6) 100%)`
- JAMAIS plein écran (sauf hero boutique ÇA VA? tab)

## PILIERS — COULEURS
| Pilier | Couleur | Hex |
|--------|---------|-----|
| 01 L'Aventure | Bleu | #1A5A7F |
| 02 La Connaissance | Rose | #C87090 |
| 03 Les 3 Temps du Soi | Violet | #7F5A8A |
