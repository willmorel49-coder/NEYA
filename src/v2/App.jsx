/* ============================================================
   ÇA VA ? V2 — App Root (Shell + 3 tabs)
   ============================================================
   Onboarding (premier launch) → Shell avec 3 tabs :
     Aventure (default) · Cocon · Communauté
   + Meditation overlay (déclenché depuis Aventure)
   ============================================================ */

import { useState, useEffect, useRef } from 'react';
import { isOnboarded, getProfile, patchProfile, ls, haptic, checkMilestone, isMilestoneSeen, markMilestoneSeen, recordVisitToday } from './state';
import { WORLDS } from './worlds';
import Splash from './screens/Splash';
import OnboardingFlow from '../components/onboarding/OnboardingFlow';
import Onboarding from './screens/Onboarding';
import Aventure from './screens/Aventure';
import Cocon from './screens/Cocon';
import Communaute from './screens/Communaute';
import CaVa from './screens/CaVa';
import Meditation from './screens/Meditation';
import Crise from './screens/Crise';
import CriseSettings from './screens/CriseSettings';
import Aide from './screens/Aide';
import EspacesIRL from './screens/EspacesIRL';
import Habitudes from './screens/Habitudes';
import EspaceVrai from './screens/EspaceVrai';
import Bilan from './screens/Bilan';
import BilanSemaine from './screens/BilanSemaine';
import MilestoneToast from './screens/MilestoneToast';
import BottomNav from '../components/BottomNav';
import ActionSheet from '../components/ActionSheet';
import { ToastProvider } from '../components/ui';

export default function V2App() {
  return (
    <ToastProvider>
      <V2AppInner />
    </ToastProvider>
  );
}

function V2AppInner() {
  const [splashDone, setSplashDone] = useState(false);
  const [onboarded, setOnboarded] = useState(() => isOnboarded());
  const [activeTab, setActiveTab] = useState(() => ls.get('active_tab', 'aventure'));
  const [meditationOpen, setMeditationOpen] = useState(false);
  const [criseOpen, setCriseOpen] = useState(false);
  const [aideOpen, setAideOpen] = useState(false);
  const [espacesIRLOpen, setEspacesIRLOpen] = useState(false);
  const [sosMenuOpen, setSosMenuOpen] = useState(false);
  const [criseSettingsOpen, setCriseSettingsOpen] = useState(false);
  const [habitudesOpen, setHabitudesOpen] = useState(false);
  const [espaceVraiOpen, setEspaceVraiOpen] = useState(false);
  const [bilanOpen, setBilanOpen] = useState(false);
  const [bilanSemaineOpen, setBilanSemaineOpen] = useState(false);
  const [milestoneDay, setMilestoneDay] = useState(null);
  const [fullscreenOverlayOpen, setFullscreenOverlayOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [onboardingReviewOpen, setOnboardingReviewOpen] = useState(false);

  // Patronus + Tour supprimés du flow post-onboarding (v30) :
  // l'onboarding visuel pré-app suffit, on entre direct dans l'app.

  // ──────────────────────────────────────────────────────────────
  // Z-INDEX HIERARCHY (single source of truth pour V2App shell)
  //   BottomNav .................... 30
  //   Back buttons (in-screen) ..... 80
  //   SOS button (FAB) ............. 100
  //   Menu hamburger (top-left) .... 100
  //   ActionSheets ................. 200 (cf. ActionSheet.jsx interne)
  //   Modals plein écran ........... 9999 (Meditation, Crise, EspaceVrai)
  //   Onboarding ................... 9999
  // ──────────────────────────────────────────────────────────────

  // Écoute les overlays fullscreen (AventurePlayer, etc.) pour cacher
  // BottomNav + SOS — évite que la barre cache les CTA en bas (Safari).
  useEffect(() => {
    const onOverlay = (e) => {
      const open = !!(e && e.detail && e.detail.open);
      setFullscreenOverlayOpen(open);
    };
    window.addEventListener('neya:fullscreen-overlay', onOverlay);
    return () => window.removeEventListener('neya:fullscreen-overlay', onOverlay);
  }, []);

  // Check milestone on app open (visit recorded → joursConnectes → check)
  useEffect(() => {
    if (!onboarded) return;
    const profile = recordVisitToday();
    const day = profile.progress?.joursConnectes || 0;
    if (!checkMilestone(day) || isMilestoneSeen(day)) return;
    let inner = null;
    const outer = setTimeout(() => {
      // Guard : éviter l'overlap avec les overlays d'intro (Patronus / Tour)
      const introActive = !ls.get('patronus_seen', false) || !ls.get('tour_seen', false);
      if (introActive) {
        // Defer behind intro flow
        inner = setTimeout(() => setMilestoneDay(day), 6000);
      } else {
        setMilestoneDay(day);
      }
    }, 1200);
    return () => {
      clearTimeout(outer);
      if (inner) clearTimeout(inner);
    };
  }, [onboarded]);
  const [activeWorldKey, setActiveWorldKey] = useState(
    () => getProfile().progress.currentWorld || 'foret'
  );

  // Long-press 2s → trigger crisis flow (with 1.2s warning haptic)
  const longPressTimerRef = useRef(null);
  const longPressWarnRef = useRef(null);

  // Horizontal swipe between tabs (iOS HIG paged-tab style)
  const TAB_ORDER = ['aventure', 'cocon', 'communaute', 'cava'];
  const swipeRef = useRef({ x: 0, y: 0, started: false });

  const anyOverlayOpen =
    meditationOpen ||
    criseOpen ||
    habitudesOpen ||
    espaceVraiOpen ||
    bilanOpen ||
    bilanSemaineOpen ||
    milestoneDay !== null;

  const startLongPress = (e) => {
    // Bail if touch starts on a child that uses its own long-press
    // (e.g. Communaute post cards) — prevents conflicting gestures.
    if (e && e.target && typeof e.target.closest === 'function') {
      if (e.target.closest('[data-no-crisis-press]')) return;
      // Also bail if pressing interactive elements
      if (e.target.closest('button, a, input, textarea, select')) return;
    }
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    if (longPressWarnRef.current) clearTimeout(longPressWarnRef.current);

    // Warning haptic at 1200ms — user knows they're about to trigger
    longPressWarnRef.current = setTimeout(() => {
      haptic(4);
      longPressWarnRef.current = null;
    }, 1200);

    longPressTimerRef.current = setTimeout(() => {
      if (longPressWarnRef.current) {
        clearTimeout(longPressWarnRef.current);
        longPressWarnRef.current = null;
      }
      haptic([4, 80, 8, 80, 8]);
      setCriseOpen(true);
      longPressTimerRef.current = null;
    }, 2000);

    // Track swipe start (skip if any overlay open — let overlay handle gesture)
    if (!anyOverlayOpen && e && e.touches && e.touches[0]) {
      const t = e.touches[0];
      swipeRef.current = { x: t.clientX, y: t.clientY, started: true };
    } else {
      swipeRef.current = { x: 0, y: 0, started: false };
    }
  };

  const handleSwipeEnd = (e) => {
    if (!swipeRef.current.started) return;
    swipeRef.current.started = false;
    if (anyOverlayOpen) return;
    const t = e && e.changedTouches && e.changedTouches[0];
    if (!t) return;
    const dx = t.clientX - swipeRef.current.x;
    const dy = t.clientY - swipeRef.current.y;
    if (Math.abs(dx) < 80) return;
    if (Math.abs(dx) < Math.abs(dy) * 1.5) return;
    const currentIdx = TAB_ORDER.indexOf(activeTab);
    if (currentIdx < 0) return;
    if (dx < 0 && currentIdx < TAB_ORDER.length - 1) {
      setActiveTab(TAB_ORDER[currentIdx + 1]);
      haptic(4);
    } else if (dx > 0 && currentIdx > 0) {
      setActiveTab(TAB_ORDER[currentIdx - 1]);
      haptic(4);
    }
  };

  const cancelLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    if (longPressWarnRef.current) {
      clearTimeout(longPressWarnRef.current);
      longPressWarnRef.current = null;
    }
  };

  // Separate cleanup for swipe (called on move, but not on plain touchend
  // since handleSwipeEnd needs swipeRef.started intact to decide direction)
  const resetSwipe = () => {
    swipeRef.current.started = false;
  };

  useEffect(() => {
    ls.set('active_tab', activeTab);
  }, [activeTab]);

  // Auto-close transient overlays when tab changes (intro overlays kept)
  useEffect(() => {
    setMeditationOpen(false);
    setCriseOpen(false);
    setHabitudesOpen(false);
    setEspaceVraiOpen(false);
    setBilanOpen(false);
    setBilanSemaineOpen(false);
  }, [activeTab]);

  // Cross-tab deep-link event — other screens dispatch `neya:switch-tab`
  useEffect(() => {
    const handler = (e) => {
      const target = e.detail;
      if (TAB_ORDER.includes(target)) {
        setActiveTab(target);
        haptic(4);
      }
    };
    window.addEventListener('neya:switch-tab', handler);
    return () => window.removeEventListener('neya:switch-tab', handler);
  }, []);

  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
      if (longPressWarnRef.current) clearTimeout(longPressWarnRef.current);
    };
  }, []);

  // Global event for crisis open (e.g. depuis composer Communaute si keywords detectes)
  useEffect(() => {
    const handler = () => { haptic(6); setCriseOpen(true); };
    window.addEventListener('neya:open-crisis', handler);
    return () => window.removeEventListener('neya:open-crisis', handler);
  }, []);

  // Track post-onboarding intro timers to clear on unmount
  const introTimersRef = useRef([]);
  const queueIntroTimer = (cb, ms) => {
    const id = setTimeout(() => {
      introTimersRef.current = introTimersRef.current.filter((x) => x !== id);
      cb();
    }, ms);
    introTimersRef.current.push(id);
  };

  useEffect(() => {
    return () => {
      introTimersRef.current.forEach(clearTimeout);
      introTimersRef.current = [];
    };
  }, []);

  const handleMilestoneClose = () => {
    if (milestoneDay !== null) markMilestoneSeen(milestoneDay);
    setMilestoneDay(null);
  };

  const handleOpenMeditation = () => setMeditationOpen(true);

  const handleOpenWorld = (worldKey) => {
    setActiveWorldKey(worldKey);
    setMeditationOpen(true);
  };

  const openCrisis = () => {
    haptic(6);
    setCriseOpen(true);
  };

  // Determine accent for BottomNav based on active tab/world
  const navAccent =
    activeTab === 'aventure'
      ? (WORLDS[activeWorldKey] || WORLDS.foret).accent
      : activeTab === 'cocon'
        ? (WORLDS[getTotemWorld(getProfile().totem)] || WORLDS.foret).accent
        : activeTab === 'communaute'
          ? WORLDS.communaute.accent
          : 'var(--cava-warm)';

  // Premier launch : Onboarding visuel pré-app (4 écrans swipe + photos)
  // → court-circuite Splash + Patronus + Tour pour une entrée directe dans l'app.
  const hasSeenOnboarding = (() => {
    try { return localStorage.getItem('neya_onboarded') === 'true'; } catch { return false; }
  })();
  if (!onboarded || !hasSeenOnboarding) {
    return (
      <OnboardingFlow
        onComplete={() => {
          try {
            localStorage.setItem('neya_onboarded', 'true');
            ls.set('patronus_seen', true);
            ls.set('tour_seen', true);
          } catch {}
          patchProfile({ onboarding: { ...(getProfile().onboarding || {}), completed: true } });
          setSplashDone(true);
          setOnboarded(true);
        }}
      />
    );
  }

  if (!splashDone) {
    return <Splash onContinue={() => setSplashDone(true)} />;
  }

  // SOS / Menu visible only when user is in main shell — hidden during intro overlays
  const showSosButton = onboarded && splashDone && !criseOpen && !aideOpen && !espacesIRLOpen && !criseSettingsOpen && !habitudesOpen && !espaceVraiOpen && !bilanOpen && !bilanSemaineOpen && !fullscreenOverlayOpen && !onboardingReviewOpen;
  const showMenuButton = showSosButton;

  return (
    <div
      style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}
      onTouchStart={startLongPress}
      onTouchEnd={(e) => { cancelLongPress(); handleSwipeEnd(e); }}
      onTouchMove={cancelLongPress}
      onTouchCancel={(e) => { cancelLongPress(); swipeRef.current.started = false; }}
      onMouseDown={startLongPress}
      onMouseUp={cancelLongPress}
      onMouseLeave={cancelLongPress}
    >
      {/* All 4 screens mounted permanently — state (filters, scroll, drawers)
          preserved across tab switches. Active screen visible + interactive,
          others faded out + pointer-events disabled. iOS-native tab behavior. */}
      <div style={{ position: 'absolute', inset: 0 }}>
        {[
          {
            key: 'aventure',
            node: (
              <Aventure
                onOpenMeditation={handleOpenMeditation}
                onOpenWorld={handleOpenWorld}
                onOpenHabitudes={() => setHabitudesOpen(true)}
                onOpenEspaceVrai={() => setEspaceVraiOpen(true)}
                onOpenBilan={() => setBilanOpen(true)}
                onOpenBilanSemaine={() => setBilanSemaineOpen(true)}
              />
            ),
          },
          { key: 'cocon', node: <Cocon /> },
          { key: 'communaute', node: <Communaute /> },
          { key: 'cava', node: <CaVa /> },
        ].map(({ key, node }) => {
          const isActive = activeTab === key;
          return (
            <div
              key={key}
              aria-hidden={!isActive}
              style={{
                position: 'absolute',
                inset: 0,
                opacity: isActive ? 1 : 0,
                pointerEvents: isActive ? 'auto' : 'none',
                transition: 'opacity 280ms var(--ease-out)',
                zIndex: isActive ? 2 : 1,
                overflow: 'hidden',
              }}
            >
              {node}
            </div>
          );
        })}
      </div>

      {!fullscreenOverlayOpen && (
        <BottomNav active={activeTab} onChange={setActiveTab} accent={navAccent} />
      )}

      {/* Permanent Menu button — glassmorphism top-left */}
      {showMenuButton && (
        <button
          type="button"
          onClick={() => { haptic(4); setMenuOpen(true); }}
          aria-label="Menu"
          data-no-crisis-press="true"
          style={{
            position: 'fixed',
            top: 'calc(env(safe-area-inset-top, 0px) + 14px)',
            left: 16,
            width: 44,
            height: 44,
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.85)',
            background: 'rgba(255,255,255,0.75)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            color: 'var(--blue-700)',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(10,36,56,0.10)',
            zIndex: 100,
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <svg width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden="true">
            <path d="M1 1h16M1 7h16M1 13h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      )}

      {/* Permanent SOS button — FAB bas-droite (au-dessus BottomNav)
          z-index 100 · pill 52x52 · rose plein · fade+rise mount */}
      <SosFab visible={showSosButton} onTap={() => { haptic(4); setSosMenuOpen(true); }} />

      {meditationOpen && (
        <Meditation
          worldKey={activeWorldKey}
          onClose={() => setMeditationOpen(false)}
        />
      )}

      {habitudesOpen && (
        <Habitudes
          onClose={() => setHabitudesOpen(false)}
          onOpenMeditation={() => {
            setHabitudesOpen(false);
            setMeditationOpen(true);
          }}
        />
      )}

      {criseOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
          <Crise onClose={() => setCriseOpen(false)} />
        </div>
      )}

      {aideOpen && <Aide onClose={() => setAideOpen(false)} />}
      {espacesIRLOpen && <EspacesIRL onClose={() => setEspacesIRLOpen(false)} />}
      {criseSettingsOpen && <CriseSettings onClose={() => setCriseSettingsOpen(false)} />}

      {menuOpen && (
        <ActionSheet
          title="Menu"
          description="Retrouver les essentiels."
          actions={[
            {
              label: 'Histoire de ÇA VA ?',
              icon: '✦',
              onTap: () => { setMenuOpen(false); setOnboardingReviewOpen(true); },
            },
            {
              label: 'Personnaliser mon refuge',
              icon: '✧',
              onTap: () => { setMenuOpen(false); setCriseSettingsOpen(true); },
            },
            {
              label: 'Trouver de l\'aide',
              icon: '◇',
              onTap: () => { setMenuOpen(false); setAideOpen(true); },
            },
            {
              label: 'Espaces de soutien',
              icon: '○',
              onTap: () => { setMenuOpen(false); setEspacesIRLOpen(true); },
            },
          ]}
          onClose={() => setMenuOpen(false)}
        />
      )}

      {onboardingReviewOpen && (
        <OnboardingFlow
          mode="review"
          onComplete={() => setOnboardingReviewOpen(false)}
        />
      )}

      {sosMenuOpen && (
        <ActionSheet
          title="Urgence"
          description="Si tu en as besoin, maintenant."
          actions={[
            {
              label: 'Suicide Écoute · 3114',
              role: 'destructive',
              icon: '✆',
              onTap: () => { setSosMenuOpen(false); window.location.href = 'tel:3114'; },
            },
            {
              label: 'SAMU · 15',
              role: 'destructive',
              icon: '✆',
              onTap: () => { setSosMenuOpen(false); window.location.href = 'tel:15'; },
            },
            {
              label: 'Mode crise — respirer 90s',
              icon: '✦',
              onTap: () => { setSosMenuOpen(false); setCriseOpen(true); },
            },
          ]}
          onClose={() => setSosMenuOpen(false)}
        />
      )}

      {espaceVraiOpen && (
        <EspaceVrai
          worldKey={activeWorldKey}
          onClose={() => setEspaceVraiOpen(false)}
        />
      )}

      {bilanOpen && <Bilan onClose={() => setBilanOpen(false)} />}

      {bilanSemaineOpen && <BilanSemaine onClose={() => setBilanSemaineOpen(false)} />}

      {milestoneDay !== null && <MilestoneToast day={milestoneDay} onClose={handleMilestoneClose} />}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// SosFab — Floating Action Button bas-droite (au-dessus BottomNav)
//   · pill 52x52 · rose plein · ombre marquée
//   · mount : fade-in + translateY(20→0) sur 400ms ease-out
//   · unmount : fade-out 200ms ease-in
//   · z-index 100 (cf. hierarchy doc dans V2App)
// ──────────────────────────────────────────────────────────────
function SosFab({ visible, onTap }) {
  const [render, setRender] = useState(visible);
  const [shown, setShown] = useState(false);
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    if (visible) {
      setRender(true);
      const id = requestAnimationFrame(() => {
        setTimeout(() => setShown(true), 16);
      });
      return () => cancelAnimationFrame(id);
    }
    setShown(false);
    setPressed(false);
    const t = setTimeout(() => setRender(false), 220);
    return () => clearTimeout(t);
  }, [visible]);

  if (!render) return null;

  // Compose transform : translateY (mount/unmount) + scale (press)
  const baseY = shown ? 0 : 20;
  const scale = pressed ? 0.95 : 1;
  const transform = `translateY(${baseY}px) scale(${scale})`;

  // Transitions : mount/unmount drive opacity+transform ; press uses fast scale
  const transition = pressed
    ? 'transform 90ms cubic-bezier(0.32, 0.72, 0, 1), box-shadow 90ms ease-out'
    : shown
      ? 'opacity 400ms cubic-bezier(0.16,1,0.3,1), transform 400ms cubic-bezier(0.16,1,0.3,1), box-shadow 240ms ease-out'
      : 'opacity 200ms ease-in, transform 200ms ease-in';

  const releasePress = () => setPressed(false);

  return (
    <button
      type="button"
      onClick={onTap}
      onPointerDown={() => setPressed(true)}
      onPointerUp={releasePress}
      onPointerCancel={releasePress}
      onPointerLeave={releasePress}
      aria-label="SOS — soutien et ressources"
      data-no-crisis-press="true"
      style={{
        position: 'fixed',
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 90px)',
        right: 16,
        width: 52,
        height: 52,
        padding: 0,
        borderRadius: 50,
        border: 'none',
        background: 'var(--rose-700)',
        color: 'white',
        fontFamily: 'var(--font-ui)',
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        cursor: 'pointer',
        boxShadow: pressed
          ? '0 4px 12px rgba(200,112,144,0.25)'
          : shown
            ? '0 8px 24px rgba(200,112,144,0.40)'
            : '0 4px 12px rgba(200,112,144,0.20)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        WebkitTapHighlightColor: 'transparent',
        opacity: shown ? 1 : 0,
        transform,
        transition,
        willChange: 'transform, opacity',
      }}
    >
      SOS
    </button>
  );
}

function getTotemWorld(totem) {
  const map = {
    lion: 'foret',
    ours: 'temple',
    aigle: 'oasis',
    daim: 'lac',
    baleine: 'montagne',
    renard: 'communaute',
  };
  return map[totem] || 'foret';
}
