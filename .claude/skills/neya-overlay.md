# NÉYA — Pattern Overlay iOS standard

> Skill lazy-loaded. Invoquer pour CRÉER ou MIGRER une fenêtre qui s'ouvre par-dessus l'écran (modal/sheet).

## Quand utiliser

- Création d'un nouvel overlay (nouvelle fenêtre type Carnet, MoodTracker, Bilan…)
- Migration d'un overlay existant vers le standard
- Audit a11y d'un overlay

## Comportements iOS standard obligatoires

Toute fenêtre qui s'ouvre par-dessus l'écran DOIT supporter :

1. **Body scroll lock** — la page derrière reste figée tant que la fenêtre est ouverte
2. **Escape clavier** — ferme la fenêtre (sauf flows safety type Crise)
3. **role="dialog" + aria-modal + aria-label** — accessibilité
4. **Focus trap** — Tab cycle dans la fenêtre, ne sort pas
5. **Restore focus** — au déclencheur quand on ferme
6. **Drag handle haut + swipe down** — `useSwipeToDismiss` (sheet bottom)
7. **Edge swipe back** — `useEdgeSwipeBack` (depuis bord gauche)
8. **Bouton fermer hit zone 44×44** — coin haut-gauche ou haut-droit
9. **Backdrop tap** — ferme aussi (cohérent avec iOS)
10. **Animations spring-soft** — pas de bounce excessif, durée 320ms standard

## Hook standard : useStandardOverlay

Le hook `/Users/williammorel/NÉYA/src/v2/hooks/useStandardOverlay.js` apporte les comportements 1-5 (les techniques). Les comportements 6-10 viennent des hooks gestuels existants (`useSwipeToDismiss`, `useEdgeSwipeBack`) et du markup.

### Signature

```js
const { dialogProps, containerRef, titleId } = useStandardOverlay({
  open: !closing,           // boolean — la fenêtre est-elle ouverte ?
  onClose: handleClose,     // fonction de fermeture
  labelText: 'Mon carnet',  // texte court FR pour aria-label (recommandé)
  // ou labelledBy: 'mon-titre-id'
  scrollLock: true,         // default true
  escapeCloses: true,       // default true — passer false pour Crise/safety flows
  focusTrap: true,          // default true
  restoreFocus: true,       // default true
});
```

### Application sur le conteneur racine

```jsx
return (
  <div
    ref={containerRef}
    {...dialogProps}
    {...bindEdge}  // si useEdgeSwipeBack
    className="wash-temple"
    style={{ position: 'absolute', inset: 0, ... }}
  >
    {/* drag handle, contenu, bouton fermer */}
  </div>
);
```

## Référence pilote

`/Users/williammorel/NÉYA/src/v2/screens/Carnet.jsx` est l'EXEMPLE COMPLET. Tout overlay nouveau ou migré doit suivre ce pattern.

## DA pour overlays

- **Fond** : `var(--cream)` ou un wash (`wash-temple`, `wash-dawn`, `wash-lac`…) selon le contexte
- **Position** : `position: absolute, inset: 0, zIndex: 80` (overlays normaux), `zIndex: 9999` (Crise uniquement)
- **Drag handle** : `width: 36px, height: 5px, border-radius: pill, background: rgba(26,26,47,0.18)`, grow à 40×6 + plus dark pendant drag
- **Bouton fermer** : 44×44 hit zone, `position: absolute, top: 18px, left: 12px`, aria-label="Retour"
- **Animations** : `transform: translateY(100%)` → `0` via `var(--ease-spring-ios)` 320ms

## Cas particuliers

### Crise (safety flow)
Passer `escapeCloses: false` au hook. L'utilisateur doit aller jusqu'au bout du flow (4 phases : respiration → ressources → numéro 3114 → journal).

### EspaceVrai (long-press 800ms)
Le focus trap n'intercepte que Tab (clavier), pas les touch events. Long-press handler intact.

### Meditation (audio + timers)
Le hook ne touche jamais AudioContext, ConvolverNode, gain ramps, wake-lock screen. Audio API reste intacte.

### ActionSheet (composant partagé)
Attacher `containerRef` au `sheetWrap` (pas au backdrop) pour éviter conflit focus trap vs clic dismiss.

## Anti-patterns

- ❌ Réinventer body-scroll-lock en dur (utiliser le hook)
- ❌ Oublier role/aria-modal/aria-label (le hook les fournit)
- ❌ Mettre `aria-modal` ou `role="dialog"` en dur SI on étale dialogProps (doublon ARIA)
- ❌ Position fixed pour les overlays internes (utiliser absolute + parent positionné)
- ❌ Animation bounce excessive — spring-soft only
- ❌ Bouton fermer < 44×44
- ❌ Pas de touche Escape (sauf Crise)
