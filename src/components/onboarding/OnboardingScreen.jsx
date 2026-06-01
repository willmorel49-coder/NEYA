import { useState, useEffect } from 'react';
import styles from './onboarding.module.css';
import { getProfile, patchProfile } from '../../v2/state';
import { hasStarToday } from '../../v2/helpers/stars';
import { PoseEtoileModal } from '../ui';

// Normalise une valeur de choix (lowercase + retire accents) — utilisé pour
// stockage côté couleurFavorite/heureRituel ET pour le match isSelected dans l'UI.
function normalizeChoiceValue(choice, preferenceKey) {
  if (['couleurFavorite', 'heureRituel'].includes(preferenceKey)) {
    return String(choice).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }
  return choice;
}

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
  // Re-render trigger : quand on revient sur cet écran, recalcule l'état des choix
  // (le user a pu modifier ses préférences puis revenir).
  const [, forceRefresh] = useState(0);
  useEffect(() => {
    if (isActive) {
      setAnimKey((k) => k + 1);
      // Force re-lecture des preferences à chaque ré-activation de l'écran.
      forceRefresh((n) => n + 1);
    }
  }, [isActive]);

  // Valeur sélectionnée actuelle pour ce preferenceKey (si écran de type preference).
  const currentPrefValue =
    screen.type === 'preference' && screen.preferenceKey
      ? (getProfile().preferences || {})[screen.preferenceKey]
      : undefined;

  // L'utilisateur a-t-il déjà fait un choix sur cet écran preference ?
  const hasPreferenceChoice =
    screen.type === 'preference' && currentPrefValue != null && currentPrefValue !== '';

  // Pour pose-star : a-t-on déjà posé une étoile aujourd'hui ?
  const starPosed = screen.type === 'pose-star' ? hasStarToday() : false;

  const handleChoice = (choice) => {
    const value = normalizeChoiceValue(choice, screen.preferenceKey);
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
    // Pose-star : tap-droite désactivé tant que l'étoile n'est pas posée.
    // (CTA visible « Pose ta première étoile » + hint dans la zone content.)
    if (screen.type === 'pose-star') {
      if (starPosed) {
        // Étoile déjà posée → on autorise la sortie de l'onboarding.
        onStart?.();
      }
      return;
    }
    // Preference : si le user n'a pas encore choisi, le tap-droite ne saute pas
    // (il doit faire un choix). Si déjà choisi (visite ultérieure), on avance.
    if (screen.type === 'preference') {
      if (hasPreferenceChoice) {
        if (isLast) onStart?.();
        else onNext?.();
      }
      return;
    }
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
            {screen.choices.map((choice) => {
              const normalized = normalizeChoiceValue(choice, screen.preferenceKey);
              const isSelected = currentPrefValue === normalized;
              return (
                <button
                  key={choice}
                  type="button"
                  onClick={() => handleChoice(choice)}
                  aria-pressed={isSelected}
                  style={{
                    appearance: 'none',
                    background: isSelected
                      ? 'rgba(200, 112, 144, 0.14)'
                      : 'rgba(255,255,255,0.85)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: isSelected
                      ? '1px solid var(--rose-700)'
                      : '1px solid rgba(255,255,255,0.9)',
                    boxShadow: isSelected
                      ? '0 4px 18px rgba(200, 112, 144, 0.18)'
                      : 'none',
                    borderRadius: 50,
                    padding: '12px 18px',
                    minHeight: 44,
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontStyle: 'italic',
                    fontWeight: isSelected ? 400 : 300,
                    fontSize: 15,
                    color: isSelected ? 'var(--rose-700)' : 'var(--blue-900)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    WebkitTapHighlightColor: 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    transition: 'background 220ms ease, border 220ms ease, color 220ms ease, box-shadow 220ms ease',
                  }}
                >
                  <span>« {choice} »</span>
                  {isSelected && (
                    <span
                      aria-hidden="true"
                      style={{
                        fontFamily: "'Inter', system-ui, sans-serif",
                        fontStyle: 'normal',
                        fontSize: 14,
                        fontWeight: 600,
                        color: 'var(--rose-700)',
                        lineHeight: 1,
                      }}
                    >
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
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
                aria-label={
                  starPosed
                    ? 'Voir ton étoile du jour'
                    : (screen.ctaLabel || 'Poser ma première étoile')
                }
              >
                {starPosed
                  ? 'Voir ton étoile'
                  : (screen.ctaLabel || 'Poser ma première étoile')}
              </button>
              {!starPosed && (
                <p
                  style={{
                    marginTop: 10,
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontStyle: 'italic',
                    fontWeight: 300,
                    fontSize: 14,
                    lineHeight: 1.5,
                    color: 'var(--text-muted)',
                    opacity: 0.85,
                    textAlign: 'center',
                  }}
                  aria-live="polite"
                >
                  Pose ton étoile pour continuer.
                </p>
              )}
            </div>
            <PoseEtoileModal
              open={poseStarOpen}
              onClose={() => {
                setPoseStarOpen(false);
                // Re-évalue starPosed (l'utilisateur a pu poser puis fermer).
                forceRefresh((n) => n + 1);
              }}
              onPosed={() => {
                setPoseStarOpen(false);
                forceRefresh((n) => n + 1);
                onStart?.();
              }}
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
