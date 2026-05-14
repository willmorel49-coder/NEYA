/* ============================================================
   NÉYA V2 — App Root (router)
   ============================================================
   Routes :
   - !isOnboarded()       → Onboarding
   - otherwise            → Aventure (home)
   - meditationOpen       → Meditation overlay
   ============================================================ */

import { useState, useEffect } from 'react';
import { isOnboarded, getProfile } from './state';
import Onboarding from './screens/Onboarding';
import Aventure from './screens/Aventure';
import Meditation from './screens/Meditation';

export default function V2App() {
  const [onboarded, setOnboarded] = useState(() => isOnboarded());
  const [meditationOpen, setMeditationOpen] = useState(false);
  const [activeWorld, setActiveWorld] = useState(() => getProfile().progress.currentWorld || 'foret');

  const handleOnboardingComplete = () => {
    setOnboarded(true);
  };

  const handleOpenMeditation = () => {
    setMeditationOpen(true);
  };

  const handleOpenWorld = (worldKey) => {
    setActiveWorld(worldKey);
    setMeditationOpen(true);
  };

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {!onboarded ? (
        <Onboarding onComplete={handleOnboardingComplete} />
      ) : (
        <Aventure
          onOpenMeditation={handleOpenMeditation}
          onOpenWorld={handleOpenWorld}
        />
      )}

      {meditationOpen && (
        <Meditation
          worldKey={activeWorld}
          onClose={() => setMeditationOpen(false)}
        />
      )}
    </div>
  );
}
