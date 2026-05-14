/* ============================================================
   NÉYA V2 — App Root (Shell + 3 tabs)
   ============================================================
   Onboarding (premier launch) → Shell avec 3 tabs :
     Aventure (default) · Cocon · Communauté
   + Meditation overlay (déclenché depuis Aventure)
   ============================================================ */

import { useState, useEffect } from 'react';
import { isOnboarded, getProfile, ls } from './state';
import { WORLDS } from './worlds';
import Onboarding from './screens/Onboarding';
import Aventure from './screens/Aventure';
import Cocon from './screens/Cocon';
import Communaute from './screens/Communaute';
import CaVa from './screens/CaVa';
import Meditation from './screens/Meditation';
import BottomNav from '../components/BottomNav';

export default function V2App() {
  const [onboarded, setOnboarded] = useState(() => isOnboarded());
  const [activeTab, setActiveTab] = useState(() => ls.get('active_tab', 'aventure'));
  const [meditationOpen, setMeditationOpen] = useState(false);
  const [activeWorldKey, setActiveWorldKey] = useState(
    () => getProfile().progress.currentWorld || 'foret'
  );

  useEffect(() => {
    ls.set('active_tab', activeTab);
  }, [activeTab]);

  const handleOnboardingComplete = () => setOnboarded(true);

  const handleOpenMeditation = () => setMeditationOpen(true);

  const handleOpenWorld = (worldKey) => {
    setActiveWorldKey(worldKey);
    setMeditationOpen(true);
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

  if (!onboarded) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {activeTab === 'aventure' && (
        <Aventure
          onOpenMeditation={handleOpenMeditation}
          onOpenWorld={handleOpenWorld}
        />
      )}
      {activeTab === 'cocon' && <Cocon />}
      {activeTab === 'communaute' && <Communaute />}
      {activeTab === 'cava' && <CaVa />}

      <BottomNav active={activeTab} onChange={setActiveTab} accent={navAccent} />

      {meditationOpen && (
        <Meditation
          worldKey={activeWorldKey}
          onClose={() => setMeditationOpen(false)}
        />
      )}
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
