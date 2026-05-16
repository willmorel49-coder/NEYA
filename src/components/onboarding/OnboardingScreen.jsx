import { useState, useEffect } from 'react';
import styles from './onboarding.module.css';

export default function OnboardingScreen({
  screen,
  index,
  isActive,
  isLast,
  onPrev,
  onNext,
  onStart,
  isFirst,
}) {
  // Re-trigger entrance animation each time the screen becomes active
  const [animKey, setAnimKey] = useState(0);
  useEffect(() => {
    if (isActive) setAnimKey((k) => k + 1);
  }, [isActive]);

  const handleLeftTap = (e) => {
    e.preventDefault();
    if (isFirst) return;
    onPrev?.();
  };
  const handleRightTap = (e) => {
    e.preventDefault();
    if (isLast) {
      onStart?.();
    } else {
      onNext?.();
    }
  };

  return (
    <section
      className={styles.screen}
      data-active={isActive ? 'true' : 'false'}
      aria-hidden={!isActive}
      aria-roledescription="slide"
      aria-label={`${screen.title} — écran ${index + 1}`}
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
        <h1 className={styles.title}>{screen.title}</h1>
        <p className={styles.body}>{screen.body}</p>
        <p className={styles.subBody}>{screen.subBody}</p>
        {screen.signature && (
          <p className={styles.signature}>{screen.signature}</p>
        )}
        {isLast && (
          <div className={styles.ctaWrap}>
            <button
              type="button"
              className={styles.cta}
              onClick={onStart}
              tabIndex={isActive ? 0 : -1}
            >
              Commencer
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
