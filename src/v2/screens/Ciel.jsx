/* ============================================================
   Ciel — Écran central V5
   ============================================================
   Hero constellation (50dvh) + scroll narratif chapitres dessous.
   ============================================================ */

import { useState, useMemo } from 'react';
import { getProfile } from '../state';
import { getAllStars, getUserId, toIsoDate, getLatestStar } from '../helpers/stars';
import { generateChapters } from '../helpers/chapter-generator';
import useDailyStarStatus from '../hooks/useDailyStarStatus';
import useCitation from '../hooks/useCitation';
import { StarField, PersonAvatar, CielChapter, PoseEtoileModal } from '../../components/ui';
import AmbianceAudio from '../../components/ciel/AmbianceAudio';

export default function Ciel() {
  const [modalOpen, setModalOpen] = useState(false);
  const { posed, refresh } = useDailyStarStatus();
  const citation = useCitation();
  const userId = getUserId();
  const stars = useMemo(() => getAllStars(), [posed]);
  const chapters = useMemo(() => generateChapters(), [posed]);
  const profile = getProfile();
  const prenom = profile.preferences?.prenom || profile.pseudo || '';
  const todayStar = useMemo(() => {
    const today = toIsoDate();
    return stars.find((s) => s.date === today) || null;
  }, [stars]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'var(--ciel-bg-gradient)',
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
        color: 'var(--ciel-text)',
        paddingBottom: 90, // BottomNav clearance
      }}
    >
      <AmbianceAudio />
      {/* Glows ambient */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: -100,
          right: -80,
          width: 280,
          height: 280,
          borderRadius: '50%',
          background: 'var(--ciel-glow-rose)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 200,
          left: -100,
          width: 260,
          height: 260,
          borderRadius: '50%',
          background: 'var(--ciel-glow-violet)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          bottom: '20%',
          right: '15%',
          width: 240,
          height: 240,
          borderRadius: '50%',
          background: 'var(--ciel-glow-accent, var(--ciel-glow-rose))',
          filter: 'blur(80px)',
          pointerEvents: 'none',
          opacity: 0.7,
        }}
      />

      {/* Avatar coin haut-gauche */}
      <div style={{ position: 'absolute', top: 'calc(env(safe-area-inset-top, 0px) + 18px)', left: 18, zIndex: 5 }}>
        <PersonAvatar size={36} />
      </div>

      {/* Header text */}
      <div
        style={{
          position: 'relative',
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 28px)',
          textAlign: 'center',
          zIndex: 2,
        }}
      >
        <div
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--ciel-text-muted)',
            marginBottom: 8,
          }}
        >
          {formatGreetingDate()}
        </div>
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: 26,
            lineHeight: 1.2,
            color: 'var(--ciel-text)',
            margin: 0,
          }}
        >
          {greeting(prenom)}
        </h1>
      </div>

      {/* Constellation hero */}
      <div style={{ position: 'relative', height: '46dvh', minHeight: 280, marginTop: 14 }}>
        <StarField
          stars={stars}
          todayStar={todayStar}
          onTapToday={() => setModalOpen(true)}
          onTapStar={(s) => {
            // Future: rouvrir l'étoile
          }}
          userId={userId}
        />
      </div>

      {/* Citation flottante */}
      <div
        style={{
          position: 'relative',
          textAlign: 'center',
          padding: '12px 32px 24px',
          zIndex: 2,
        }}
      >
        <p
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: 15,
            color: 'rgba(251, 246, 232, 0.72)',
            margin: 0,
            lineHeight: 1.5,
            animation: 'citation-soft-fade 1800ms ease-out 600ms both',
          }}
        >
          « {citation.text} »
        </p>
        {citation.author && (
          <p
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'rgba(251, 246, 232, 0.40)',
              marginTop: 6,
            }}
          >
            — {citation.author}
          </p>
        )}
      </div>

      {/* Chapitres scroll narratif */}
      <div style={{ position: 'relative', zIndex: 2, marginTop: 8 }}>
        {chapters.length === 0 && !posed && (
          <CielChapter
            eyebrow="Premier soir"
            text="Pose ta toute première étoile. C'est par là que commence ton ciel."
            accent="rose"
          />
        )}
        {chapters.map((ch, i) => (
          <CielChapter
            key={`${ch.type}-${i}`}
            eyebrow={ch.eyebrow}
            text={ch.text}
            accent={ch.accent}
            media={ch.media}
          />
        ))}
      </div>

      {/* FAB poser étoile si déjà posée mais user veut revenir */}
      {posed && (
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          aria-label="Ajouter une étoile"
          style={{
            position: 'fixed',
            bottom: 100,
            right: 20,
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #C87090, #E080A8)',
            color: 'white',
            border: 'none',
            fontSize: 26,
            fontWeight: 300,
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(200, 112, 144, 0.40)',
            zIndex: 50,
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          +
        </button>
      )}

      <PoseEtoileModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onPosed={() => { setModalOpen(false); refresh(); }}
      />
    </div>
  );
}

function greeting(prenom) {
  const h = new Date().getHours();
  let g = 'Bonjour';
  if (h >= 18 || h < 2) g = 'Bonsoir';
  else if (h >= 12) g = 'Cet après-midi';
  else if (h < 6) g = 'Cette nuit';
  return prenom ? `${g}, ${prenom}.` : `${g}.`;
}

function formatGreetingDate() {
  const d = new Date();
  const months = ['JAN','FÉV','MAR','AVR','MAI','JUI','JUI','AOÛ','SEP','OCT','NOV','DÉC'];
  return `${d.getDate()} ${months[d.getMonth()]} · ${String(d.getHours()).padStart(2,'0')}h${String(d.getMinutes()).padStart(2,'0')}`;
}
