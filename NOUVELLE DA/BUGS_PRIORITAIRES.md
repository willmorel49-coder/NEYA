# BUGS À CORRIGER — PRIORITÉ 1

À traiter dans l'ordre avant toute nouvelle feature.

## BUG-01 · Apostrophes échappées [URGENT]
- Fichier : tous les composants de rituels
- Symptôme : `n\'est` visible à l'écran
- Fix : rechercher et remplacer TOUS les `\'` par `'`

## BUG-02 · Bouton "TERMINER CE RITUEL" hors charte
- Fichier : composant fin de rituel
- Symptôme : fond `#1a1a2e` bleu marine foncé
- Fix : remplacer par `background: linear-gradient(135deg, #1A5A7F, #2A8ABF)`

## BUG-03 · Question du jour vide
- Fichier : écran Communauté
- Symptôme : affiche `« »` sans contenu
- Fix : question par défaut hardcodée + état vide géré proprement

## BUG-04 · SOS button overlap
- Fichier : layout global
- Symptôme : chevauche le contenu sur certains écrans
- Fix : `z-index: 100` cohérent + `padding-right: 70px` sur les headers concernés

## BUG-05 · Personnage tronqué (Cocon)
- Fichier : écran Cocon
- Symptôme : personnage coupé à mi-corps
- Fix : `object-position: center 30%` + marge sécurité

## BUG-06 · "Bilan du soir" orphelin
- Fichier : écran Aventure, section TES PILIERS
- Symptôme : card sans style cohérent avec les piliers
- Fix : même glass card style, sans numéro, avec opacity réduite

## BUG-07 · NÉYA dans l'UI [REBRAND]
- Fichier : tous les fichiers
- Symptôme : "NÉYA", "Communauté NÉYA", `<title>NÉYA</title>`
- Fix : remplacer PARTOUT par "ÇA VA?"
  - grep -r "NÉYA" src/ pour lister
  - grep -r "Néya" src/ aussi (casse mixte)
