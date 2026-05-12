// NÉYA — Motion system (Apple/Linear/Arc-grade).
// Centralise easings + durations + press feedback global via Web Animations API.

export const easing = {
  standard:   'cubic-bezier(0.4, 0, 0.2, 1)',
  emphasized: 'cubic-bezier(0.22, 1, 0.36, 1)',
  decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
  accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
  spring:     'cubic-bezier(0.34, 1.56, 0.64, 1)',
  soft:       'cubic-bezier(0.16, 1.36, 0.32, 1)',
  ambient:    'cubic-bezier(0.45, 0, 0.55, 1)',
}

export const duration = {
  instant: 80,
  fast:    160,
  base:    240,
  slow:    360,
  slower:  500,
  cinema:  1400,
}

// ─── Press feedback global ─────────────────────────────────────
//
// Attache un listener au document. Toute élément avec [data-press]
// reçoit un scale 0.965 au pointerdown + spring release au pointerup.
// Utilise Web Animations API avec une seule keyframe finale (implicite start
// = computed value), donc pas de conflit avec d'éventuels inline transforms.
//
// À appeler une seule fois au mount de l'App (cleanup via la fonction retournée).

export function initPressFeedback() {
  if (typeof document === 'undefined') return () => {}

  // Respecter prefers-reduced-motion
  const reduced = typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false
  if (reduced) return () => {}

  const activeAnims = new WeakMap() // el -> Animation

  const cancelActive = (el) => {
    const anim = activeAnims.get(el)
    if (anim) { try { anim.cancel() } catch {} ; activeAnims.delete(el) }
  }

  const onDown = (e) => {
    const el = e.target.closest && e.target.closest('[data-press]')
    if (!el || el.disabled) return
    cancelActive(el)
    try {
      const a = el.animate(
        [{ transform: 'scale(0.965)' }],
        { duration: duration.instant + 20, easing: easing.standard, fill: 'forwards', composite: 'add' }
      )
      activeAnims.set(el, a)
    } catch {}
  }

  const onUp = (e) => {
    // Release: trouve l'élément même si pointer leave avant up
    const el = (e.target && e.target.closest && e.target.closest('[data-press]'))
    const targets = el ? [el] : []
    // Also release any other element currently animated
    document.querySelectorAll('[data-press]').forEach(node => {
      if (activeAnims.has(node) && !targets.includes(node)) targets.push(node)
    })
    targets.forEach(node => {
      cancelActive(node)
      try {
        const a = node.animate(
          [{ transform: 'scale(1)' }],
          { duration: duration.base + 40, easing: easing.spring, fill: 'forwards', composite: 'add' }
        )
        activeAnims.set(node, a)
      } catch {}
    })
  }

  document.addEventListener('pointerdown', onDown, { passive: true })
  document.addEventListener('pointerup', onUp, { passive: true })
  document.addEventListener('pointercancel', onUp, { passive: true })

  return () => {
    document.removeEventListener('pointerdown', onDown)
    document.removeEventListener('pointerup', onUp)
    document.removeEventListener('pointercancel', onUp)
  }
}

// ─── Helpers de durée formatée ─────────────────────────────────

export const ms = (n) => `${n}ms`

// ─── Modal exit helper ─────────────────────────────────────────
//
// Pattern : interpose une animation 'sheetExit' avant le vrai onClose.
// Usage :
//   const { exiting, close } = useExitAnimation(onClose)
//   <div style={{ animation: exiting ? 'sheetExit 280ms cubic-bezier(0.4,0,1,1) both' : 'modalEnter ...' }}>
//   <button onClick={close}>Fermer</button>

import { useState, useCallback } from 'react'

export function useExitAnimation(onClose, exitMs = 280) {
  const [exiting, setExiting] = useState(false)
  const close = useCallback(() => {
    if (exiting) return
    setExiting(true)
    setTimeout(() => onClose && onClose(), exitMs)
  }, [exiting, onClose, exitMs])
  return { exiting, close }
}

// ─── Streak milestones — détection one-shot ────────────────────
//
// Retourne le palier atteint (3/7/14/30/60/100) la première fois,
// puis null sur les passages suivants. Persiste via localStorage.

const MILESTONE_STEPS = [3, 7, 14, 30, 60, 100]

export function checkStreakMilestone(streak) {
  if (!MILESTONE_STEPS.includes(streak)) return null
  try {
    const key = `neya_milestone_${streak}_reached`
    if (localStorage.getItem(key)) return null
    localStorage.setItem(key, String(Date.now()))
    return streak
  } catch { return null }
}

export default { easing, duration, initPressFeedback, ms, useExitAnimation, checkStreakMilestone }
