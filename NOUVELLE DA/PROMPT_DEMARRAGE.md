# PROMPT DE DÉMARRAGE — À coller dans VS Code Claude

---

Lis d'abord le fichier CLAUDE.md à la racine du projet avant toute chose.

Voici le contexte du projet :

Tu travailles sur **ÇA VA?** — une app de bien-être émotionnel gamifiée + marque de vêtements.
La marque NÉYA n'existe plus. Toute référence à NÉYA doit être remplacée par ÇA VA?.

## MISSION IMMÉDIATE

1. Lire CLAUDE.md en entier
2. Lire BUGS_PRIORITAIRES.md
3. Lire DESIGN_SYSTEM.md
4. Lire COMPOSANTS_CSS.css pour comprendre les composants disponibles

Ensuite, dans l'ordre :

**Étape 1 — Rebrand**
Chercher et remplacer toutes les occurrences de "NÉYA" et "Néya" dans tous les fichiers.

**Étape 2 — Palette**
Appliquer la nouvelle palette bleu/rose (définie dans DESIGN_SYSTEM.md et COMPOSANTS_CSS.css) sur tous les écrans.
- Fond : #EEF3F8
- Cards : glassmorphism (rgba(255,255,255,0.65) + blur(24px))
- Blobs décoratifs rose + bleu sur chaque écran
- CTA bleu : gradient #1A5A7F → #2A8ABF
- CTA émotionnel rose : gradient #C87090 → #E080A8

**Étape 3 — Images**
Les images illustratives (paysages, personnage) doivent être dans des conteneurs délimités :
- max-height: 220px
- border-radius: 24px
- margin: 0 16px
- overlay gradient obligatoire
- JAMAIS plein écran (sauf hero boutique ÇA VA? tab)

**Étape 4 — Bugs**
Corriger les 7 bugs listés dans BUGS_PRIORITAIRES.md.

## RÈGLES ABSOLUES
- Glassmorphism sur toutes les cards (pas de blanc opaque)
- Cormorant Garamond italic pour tous les titres
- Inter pour l'UI
- Bouton "TERMINER CE RITUEL" → CTA bleu gradient (JAMAIS dark)
- Personnage toujours de dos, jamais le visage
- Safe areas iOS sur la navbar
- Aucun état vide visible

Commence par l'étape 1. Montre-moi les fichiers modifiés avant de passer à l'étape suivante.
