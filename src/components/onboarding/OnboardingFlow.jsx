import { useEffect, useRef, useState, useCallback } from 'react';
import styles from './onboarding.module.css';
import { ONBOARDING_SCREENS } from './onboardingContent';
import OnboardingScreen from './OnboardingScreen';
import ProgressDots from './ProgressDots';
import { getProfile } from '../../v2/state';

const STORAGE_KEY = 'neya_onboarded';
const EXIT_MS = 750;
const SCROLL_END_MS = 350;

export default function OnboardingFlow({ onComplete, mode = 'first-launch' }) {
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);
  const [exiting, setExiting] = useState(false);
  const total = ONBOARDING_SCREENS.length;
  const scrollTimerRef = useRef(null);
  const scrollEndTimerRef = useRef(null);
  const isScrollingRef = useRef(false);
  const exitTimerRef = useRef(null);
  const finishedRef = useRef(false);
  const isReview = mode === 'review';

  const scrollToIndex = useCallback((i) => {
    const el = trackRef.current;
    if (!el) return;
    const next = Math.max(0, Math.min(total - 1, i));
    if (next === active) return;
    isScrollingRef.current = true;
    el.scrollTo({ left: next * el.clientWidth, behavior: 'smooth' });
  }, [total, active]);

  const goNext = useCallback(() => {
    if (isScrollingRef.current) return;
    scrollToIndex(active + 1);
  }, [active, scrollToIndex]);
  const goPrev = useCallback(() => {
    if (isScrollingRef.current) return;
    scrollToIndex(active - 1);
  }, [active, scrollToIndex]);

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    if (!isReview) {
      try { localStorage.setItem(STORAGE_KEY, 'true'); } catch {}
    }
    setExiting(true);
    exitTimerRef.current = setTimeout(() => {
      onComplete?.();
    }, EXIT_MS);
  }, [onComplete, isReview]);

  // Avance d'une étape (preferences "Passer cette étape" / pose-star skip n/a).
  // Ne déclenche pas finish() — utilisé par les boutons contextuels du Skip.
  const skipOneStep = useCallback(() => {
    if (active < total - 1) {
      scrollToIndex(active + 1);
    }
  }, [active, total, scrollToIndex]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const onScroll = () => {
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = setTimeout(() => {
        const w = el.clientWidth || 1;
        const idx = Math.round(el.scrollLeft / w);
        setActive((prev) => (prev === idx ? prev : idx));
      }, 60);
      // Détection fin de scroll (debounce) — libère le guard isScrolling.
      if (scrollEndTimerRef.current) clearTimeout(scrollEndTimerRef.current);
      scrollEndTimerRef.current = setTimeout(() => {
        isScrollingRef.current = false;
      }, SCROLL_END_MS);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
      if (scrollEndTimerRef.current) clearTimeout(scrollEndTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (exiting) return;
      if (e.key === 'ArrowRight') {
        // Cohérent avec handleRightTap : sur pose-star (dernier écran),
        // ne pas finir l'onboarding au clavier — l'utilisateur doit poser
        // son étoile via le CTA visible. Sur preference, ne sauter que si choix déjà fait.
        const current = ONBOARDING_SCREENS[active];
        if (current?.type === 'pose-star') return;
        if (current?.type === 'preference') {
          const prefs = getProfile().preferences || {};
          const v = prefs[current.preferenceKey];
          if (v == null || v === '') return;
        }
        if (active === total - 1) finish();
        else goNext();
      } else if (e.key === 'ArrowLeft') {
        goPrev();
      } else if (e.key === 'Escape') {
        finish();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, total, goNext, goPrev, finish, exiting]);

  useEffect(() => {
    const onResize = () => {
      const el = trackRef.current;
      if (!el) return;
      el.scrollLeft = active * el.clientWidth;
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [active]);

  useEffect(() => {
    return () => {
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    };
  }, []);

  // Calcule le label + l'action du bouton Skip selon le contexte de l'écran actif.
  // - mode review : "Fermer" → finish()
  // - écran pose-star (8) : bouton masqué (user doit poser son étoile)
  // - écran preference (5/6/7) : "Passer cette étape" → avance d'1 cran
  // - écrans narratifs (1-4) : "Passer l'introduction" → finish() (confirm si choix préférences déjà faits)
  const activeScreen = ONBOARDING_SCREENS[active];
  const activeType = activeScreen?.type;
  let skipLabel = 'Passer';
  let skipVisible = true;
  let onSkip = finish;
  if (isReview) {
    skipLabel = 'Fermer';
    onSkip = finish;
  } else if (activeType === 'pose-star') {
    skipVisible = false;
  } else if (activeType === 'preference') {
    skipLabel = 'Passer cette étape';
    onSkip = skipOneStep;
  } else {
    skipLabel = "Passer l'introduction";
    onSkip = () => {
      try {
        const prefs = getProfile().preferences || {};
        const hasChoices = Boolean(
          prefs.mantra || prefs.couleurFavorite || prefs.heureRituel
        );
        if (hasChoices) {
          // eslint-disable-next-line no-alert
          const ok = window.confirm(
            "Tu vas passer l'introduction. Tes choix sont gardés. OK ?"
          );
          if (!ok) return;
        }
      } catch {}
      finish();
    };
  }

  return (
    <div
      className={styles.root}
      data-exiting={exiting ? 'true' : 'false'}
      role="dialog"
      aria-modal="true"
      aria-label="Bienvenue dans ÇA VA ?"
    >
      <div className={styles.blobRose} aria-hidden="true" />
      <div className={styles.blobBlue} aria-hidden="true" />

      <div className={styles.topBar}>
        <ProgressDots total={total} active={active} />
        {skipVisible && (
          <button
            type="button"
            className={styles.skip}
            onClick={onSkip}
            aria-label={skipLabel}
          >
            {skipLabel}
          </button>
        )}
      </div>

      <div className={styles.track} ref={trackRef}>
        {ONBOARDING_SCREENS.map((screen, i) => (
          <OnboardingScreen
            key={screen.id}
            screen={screen}
            index={i}
            isActive={i === active && !exiting}
            isFirst={i === 0}
            isLast={i === total - 1}
            onPrev={goPrev}
            onNext={goNext}
            onStart={finish}
            ctaLabel={isReview ? 'Retour à l’app' : 'Commencer'}
          />
        ))}
      </div>

      <div className={styles.exitVeil} aria-hidden="true" />
    </div>
  );
}
