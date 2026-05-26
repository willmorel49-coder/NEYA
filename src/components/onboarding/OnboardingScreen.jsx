import { useState, useEffect } from 'react';
import styles from './onboarding.module.css';
import { getProfile, patchProfile } from '../../v2/state';
import { PoseEtoileModal } from '../ui';

function RichText({ tokens, className }) {
  if (typeof tokens === 'string') return <span className={className}>{tokens}</span>;
  if (!Array.isArray(tokens)) return null;
  return (
    <span className={className}>
      {tokens.map((t, i) =>
        typeof t === 'string' ? (
          <span key={i}>{t}</span>
        ) : (
          <em key={i} className={styles.em}>{t.em}</em>
        )
      )}
    </span>
  );
}

export default function OnboardingScreen({
  screen,
  index,
  isActive,
  isLast,
  onPrev,
  onNext,
  onStart,
  isFirst,
  ctaLabel = 'Commencer',
}) {
  const [animKey, setAnimKey] = useState(0);
  const [poseStarOpen, setPoseStarOpen] = useState(false);
  useEffect(() => {
    if (isActive) setAnimKey((k) => k + 1);
  }, [isActive]);

  const handleChoice = (choice) => {
    let value = choice;
    if (['couleurFavorite', 'heureRituel'].includes(screen.preferenceKey)) {
      value = String(choice).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    }
    const current = getProfile().preferences || {};
    patchProfile({ preferences: { ...current, [screen.preferenceKey]: value } });
    onNext?.();
  };

  const handleLeftTap = (e) => {
    e.preventDefault();
    if (isFirst) return;
    onPrev?.();
  };
  const handleRightTap = (e) => {
    e.preventDefault();
    if (screen.type === 'preference') return;
    if (screen.type === 'pose-star') return;
    if (isLast) onStart?.();
    else onNext?.();
  };

  return (
    <section
      className={styles.screen}
      data-active={isActive ? 'true' : 'false'}
      aria-hidden={!isActive}
      aria-roledescription="slide"
      aria-label={`Écran ${index + 1}`}
    >
      <div className={styles.imageWrap}>
        <img
          className={styles.image}
          src={screen.image}
          alt={screen.alt}
          draggable={false}
          loading={isActive ? 'eager' : 'lazy'}
          decoding="async"
        />
        <div className={styles.overlay} aria-hidden="true" />
      </div>

      <button
        type="button"
        className={`${styles.tapZone} ${styles.tapLeft}`}
        onClick={handleLeftTap}
        aria-label="Écran précédent"
        tabIndex={isActive && !isFirst ? 0 : -1}
        disabled={isFirst}
      />
      <button
        type="button"
        className={`${styles.tapZone} ${styles.tapRight}`}
        onClick={handleRightTap}
        aria-label={isLast ? 'Commencer' : 'Écran suivant'}
        tabIndex={isActive ? 0 : -1}
      />

      <div
        key={animKey}
        className={styles.content}
        data-animate={isActive ? 'true' : 'false'}
      >
        {screen.eyebrow && (
          <div className={styles.eyebrow}>
            {(() => {
              const parts = String(screen.eyebrow).split(/\s·\s/);
              if (parts.length === 2) {
                return (
                  <>
                    <em>{parts[0]}</em>
                    <span> · {parts[1]}</span>
                  </>
                );
              }
              return screen.eyebrow;
            })()}
          </div>
        )}
        <h1 className={styles.title}>
          <RichText tokens={screen.title} />
        </h1>
        <p className={styles.body}>
          <RichText tokens={screen.body} />
        </p>
        <p className={styles.subBody}>
          <RichText tokens={screen.subBody} />
        </p>
        {screen.signature && (
          <p className={styles.signature}>
            <RichText tokens={screen.signature} />
          </p>
        )}
        {screen.type === 'preference' && screen.choices && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
            {screen.choices.map((choice) => (
              <button
                key={choice}
                type="button"
                onClick={() => handleChoice(choice)}
                style={{
                  appearance: 'none',
                  background: 'rgba(255,255,255,0.85)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.9)',
                  borderRadius: 50,
                  padding: '12px 18px',
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontStyle: 'italic',
                  fontWeight: 300,
                  fontSize: 15,
                  color: 'var(--blue-900)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                « {choice} »
              </button>
            ))}
          </div>
        )}
        {isLast && screen.type === 'pose-star' && (
          <>
            <div className={styles.ctaWrap}>
              <button
                type="button"
                className={styles.cta}
                onClick={() => setPoseStarOpen(true)}
                tabIndex={isActive ? 0 : -1}
              >
                {screen.ctaLabel || 'Poser ma première étoile'}
              </button>
            </div>
            <PoseEtoileModal
              open={poseStarOpen}
              onClose={() => setPoseStarOpen(false)}
              onPosed={() => { setPoseStarOpen(false); onStart?.(); }}
            />
          </>
        )}
        {isLast && !screen.type && (
          <div className={styles.ctaWrap}>
            <button
              type="button"
              className={styles.cta}
              onClick={onStart}
              tabIndex={isActive ? 0 : -1}
            >
              {ctaLabel}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
