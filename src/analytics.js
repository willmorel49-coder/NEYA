// Analytics wrapper NÉYA — privacy-first, opt-in, EU only.
// Lazy-loading: posthog-js (190 kB) chargé UNIQUEMENT si consent='yes' + clé présente.
//
// Activation production:
//   1. Créer projet sur https://eu.posthog.com
//   2. Mettre VITE_POSTHOG_KEY dans `.env.production` (jamais commit)
//   3. Build + deploy. Sans clé : tout est silencieusement no-op.

const POSTHOG_KEY  = import.meta.env.VITE_POSTHOG_KEY || ''
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://eu.i.posthog.com'

const CONSENT_KEY = 'neya_analytics_consent'   // 'yes' | 'no' | undefined
const ANON_KEY    = 'neya_anon_id'

let posthog = null
let loading = null
let pendingEvents = []

function getAnonId() {
  try {
    let id = localStorage.getItem(ANON_KEY)
    if (!id) {
      id = (crypto?.randomUUID?.() || `anon-${Date.now()}-${Math.random().toString(36).slice(2)}`)
      localStorage.setItem(ANON_KEY, id)
    }
    return id
  } catch { return `ephemeral-${Date.now()}` }
}

export function getConsent() {
  try { return localStorage.getItem(CONSENT_KEY) } catch { return null }
}

async function loadPosthog() {
  if (posthog) return posthog
  if (loading) return loading
  if (!POSTHOG_KEY) return null
  loading = (async () => {
    try {
      const mod = await import('posthog-js')
      const ph = mod.default || mod
      ph.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        opt_out_capturing_by_default: false,
        disable_session_recording: true,
        mask_all_text: true,
        persistence: 'localStorage',
        autocapture: false,
        capture_pageview: false,
        bootstrap: { distinctID: getAnonId() },
      })
      posthog = ph
      // Flush pending events captured before posthog was loaded
      const events = pendingEvents.splice(0)
      for (const [ev, props] of events) {
        try { ph.capture(ev, props) } catch {}
      }
      return ph
    } catch (e) {
      return null
    }
  })()
  return loading
}

export function initAnalytics() {
  if (!POSTHOG_KEY) return
  if (getConsent() === 'yes') {
    // Charge posthog en arrière-plan (non-bloquant pour LCP)
    setTimeout(() => { loadPosthog() }, 800)
  }
}

export function setConsent(value /* 'yes' | 'no' */) {
  try {
    localStorage.setItem(CONSENT_KEY, value)
    if (value === 'yes') {
      loadPosthog()
    } else if (posthog) {
      try { posthog.opt_out_capturing() } catch {}
    }
  } catch {}
}

export function track(event, props = {}) {
  if (getConsent() !== 'yes') return
  if (!POSTHOG_KEY) return
  const enriched = { ...props, app_version: '1.0' }
  if (posthog) {
    try { posthog.capture(event, enriched) } catch {}
  } else {
    // Queue jusqu'à ce que posthog soit chargé
    pendingEvents.push([event, enriched])
    if (pendingEvents.length > 50) pendingEvents.shift()
    loadPosthog()
  }
}

// ─── Helpers spécifiques NÉYA ───────────────────

export function trackAppOpen(isFirstSession) {
  track('app_open', { is_first_session: !!isFirstSession })
}

export function trackQuizComplete(archetype, durationMs) {
  track('quiz_complete', { archetype, duration_ms: durationMs })
}

export function trackBreathComplete(technique, durationS, moodBefore, moodAfter) {
  track('breath_complete', {
    technique,
    duration_s: durationS,
    mood_before: moodBefore,
    mood_after:  moodAfter,
    mood_delta:  moodAfter - moodBefore,
  })
}

export function trackRoutineComplete(idx) {
  const h = new Date().getHours()
  const tod = h < 6 ? 'night' : h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening'
  track('routine_complete', { idx, time_of_day: tod })
}

export function trackQueteComplete(idx) {
  track('quete_complete', { idx })
}

export function trackEspaceVraiQualified(durationS) {
  track('espacevrai_session_qualified', { duration_s: durationS })
}

export function trackError(component, message) {
  track('error_boundary_caught', { component, message: String(message).slice(0, 120) })
}
