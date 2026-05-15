/* ============================================================
   NÉYA V2 — App Root (Shell + 3 tabs)
   ============================================================
   Onboarding (premier launch) → Shell avec 3 tabs :
     Aventure (default) · Cocon · Communauté
   + Meditation overlay (déclenché depuis Aventure)
   ============================================================ */

import { useState, useEffect, useRef } from 'react';
import { isOnboarded, getProfile, ls, haptic, checkMilestone, isMilestoneSeen, markMilestoneSeen, recordVisitToday } from './state';
import { WORLDS } from './worlds';
import Splash from './screens/Splash';
import Onboarding from './screens/Onboarding';
import Aventure from './screens/Aventure';
import Cocon from './screens/Cocon';
import Communaute from './screens/Communaute';
import CaVa from './screens/CaVa';
import Meditation from './screens/Meditation';
import Crise from './screens/Crise';
import Habitudes from './screens/Habitudes';
import EspaceVrai from './screens/EspaceVrai';
import Bilan from './screens/Bilan';
import BilanSemaine from './screens/BilanSemaine';
import Patronus from './screens/Patronus';
import MilestoneToast from './screens/MilestoneToast';
import Tour from './screens/Tour';
import BottomNav from '../components/BottomNav';

export default function V2App() {
  const [splashDone, setSplashDone] = useState(false);
  const [onboarded, setOnboarded] = useState(() => isOnboarded());
  const [activeTab, setActiveTab] = useState(() => ls.get('active_tab', 'aventure'));
  const [meditationOpen, setMeditationOpen] = useState(false);
  const [criseOpen, setCriseOpen] = useState(false);
  const [habitudesOpen, setHabitudesOpen] = useState(false);
  const [espaceVraiOpen, setEspaceVraiOpen] = useState(false);
  const [bilanOpen, setBilanOpen] = useState(false);
  const [bilanSemaineOpen, setBilanSemaineOpen] = useState(false);
  const [patronusOpen, setPatronusOpen] = useState(() => onboarded && !ls.get('patronus_seen', false));
  const [milestoneDay, setMilestoneDay] = useState(null);
  const [tourOpen, setTourOpen] = useState(() => onboarded && !ls.get('tour_seen', false));

  // Check milestone on app open (visit recorded → joursConnectes → check)
  useEffect(() => {
    if (!onboarded) return;
    const profile = recordVisitToday();
    const day = profile.progress?.joursConnectes || 0;
    if (checkMilestone(day) && !isMilestoneSeen(day)) {
      setTimeout(() => setMilestoneDay(day), 1200);
    }
  }, [onboarded]);
  const [activeWorldKey, setActiveWorldKey] = useState(
    () => getProfile().progress.currentWorld || 'foret'
  );

  // Long-press 1.5s → trigger crisis flow
  const longPressTimerRef = useRef(null);

  const startLongPress = () => {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = setTimeout(() => {
      haptic([4, 80, 8, 80, 8]);
      setCriseOpen(true);
      longPressTimerRef.current = null;
    }, 1500);
  };

  const cancelLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  useEffect(() => {
    ls.set('active_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    };
  }, []);

  // Global event for crisis open (e.g. depuis composer Communaute si keywords detectes)
  useEffect(() => {
    const handler = () => { haptic(6); setCriseOpen(true); };
    window.addEventListener('neya:open-crisis', handler);
    return () => window.removeEventListener('neya:open-crisis', handler);
  }, []);

  const handleOnboardingComplete = () => {
    setOnboarded(true);
    // Première entrée → Patronus reveal d'abord, puis Tour
    if (!ls.get('patronus_seen', false)) {
      setTimeout(() => setPatronusOpen(true), 400);
    } else if (!ls.get('tour_seen', false)) {
      setTimeout(() => setTourOpen(true), 600);
    }
  };

  const handlePatronusClose = () => {
    setPatronusOpen(false);
    if (!ls.get('tour_seen', false)) {
      setTimeout(() => setTourOpen(true), 400);
    }
  };

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

  if (!splashDone) {
    return <Splash onContinue={() => setSplashDone(true)} />;
  }

  if (!onboarded) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div
      style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}
      onTouchStart={startLongPress}
      onTouchEnd={cancelLongPress}
      onTouchMove={cancelLongPress}
      onTouchCancel={cancelLongPress}
      onMouseDown={startLongPress}
      onMouseUp={cancelLongPress}
      onMouseLeave={cancelLongPress}
    >
      <div
        key={activeTab}
        style={{
          position: 'absolute',
          inset: 0,
          animation: 'fade-in 320ms var(--ease-out) both',
        }}
      >
        {activeTab === 'aventure' && (
          <Aventure
            onOpenMeditation={handleOpenMeditation}
            onOpenWorld={handleOpenWorld}
            onOpenHabitudes={() => setHabitudesOpen(true)}
            onOpenEspaceVrai={() => setEspaceVraiOpen(true)}
            onOpenBilan={() => setBilanOpen(true)}
            onOpenBilanSemaine={() => setBilanSemaineOpen(true)}
          />
        )}
        {activeTab === 'cocon' && <Cocon />}
        {activeTab === 'communaute' && <Communaute />}
        {activeTab === 'cava' && <CaVa />}
      </div>

      <BottomNav active={activeTab} onChange={setActiveTab} accent={navAccent} />

      {/* Permanent SOS button — reachable in 1 tap from every screen */}
      <button
        type="button"
        onClick={openCrisis}
        aria-label="Mode crise — accès rapide"
        style={{
          position: 'fixed',
          top: 'calc(env(safe-area-inset-top, 0px) + 10px)',
          right: 12,
          width: 36,
          height: 36,
          borderRadius: '50%',
          border: '0.5px solid rgba(159, 88, 76, 0.30)',
          background: 'var(--cream)',
          color: 'var(--crisis)',
          fontFamily: 'var(--font-ui)',
          fontSize: 'var(--type-mark)',
          fontWeight: 600,
          letterSpacing: '0.04em',
          cursor: 'pointer',
          boxShadow: 'var(--shadow-soft)',
          zIndex: 40,
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        SOS
      </button>

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

      {criseOpen && <Crise onClose={() => setCriseOpen(false)} />}

      {espaceVraiOpen && (
        <EspaceVrai
          worldKey={activeWorldKey}
          onClose={() => setEspaceVraiOpen(false)}
        />
      )}

      {bilanOpen && <Bilan onClose={() => setBilanOpen(false)} />}

      {bilanSemaineOpen && <BilanSemaine onClose={() => setBilanSemaineOpen(false)} />}

      {patronusOpen && <Patronus onClose={handlePatronusClose} />}

      {milestoneDay !== null && <MilestoneToast day={milestoneDay} onClose={handleMilestoneClose} />}

      {tourOpen && <Tour onClose={() => setTourOpen(false)} />}
    </div>
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
