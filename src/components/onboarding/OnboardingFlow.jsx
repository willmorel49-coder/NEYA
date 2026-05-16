import { useEffect, useRef, useState, useCallback } from 'react';
import styles from './onboarding.module.css';
import { ONBOARDING_SCREENS } from './onboardingContent';
import OnboardingScreen from './OnboardingScreen';
import ProgressDots from './ProgressDots';

const STORAGE_KEY = 'neya_onboarded';

export default function OnboardingFlow({ onComplete }) {
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);
  const total = ONBOARDING_SCREENS.length;
  const scrollTimerRef = useRef(null);

  const scrollToIndex = useCallback((i) => {
    const el = trackRef.current;
    if (!el) return;
    const next = Math.max(0, Math.min(total - 1, i));
    el.scrollTo({ left: next * el.clientWidth, behavior: 'smooth' });
  }, [total]);

  const goNext = useCallback(() => scrollToIndex(active + 1), [active, scrollToIndex]);
  const goPrev = useCallback(() => scrollToIndex(active - 1), [active, scrollToIndex]);

  const finish = useCallback(() => {
    try { localStorage.setItem(STORAGE_KEY, 'true'); } catch {}
    onComplete?.();
  }, [onComplete]);

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
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') {
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
  }, [active, total, goNext, goPrev, finish]);

  useEffect(() => {
    const onResize = () => {
      const el = trackRef.current;
      if (!el) return;
      el.scrollLeft = active * el.clientWidth;
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [active]);

  return (
    <div className={styles.root} role="dialog" aria-modal="true" aria-label="Bienvenue dans NÉYA">
      <div className={styles.topBar}>
        <ProgressDots total={total} active={active} />
        <button
          type="button"
          className={styles.skip}
          onClick={finish}
        >
          Passer
        </button>
      </div>

      <div className={styles.track} ref={trackRef}>
        {ONBOARDING_SCREENS.map((screen, i) => (
          <OnboardingScreen
            key={screen.id}
            screen={screen}
            index={i}
            isActive={i === active}
            isFirst={i === 0}
            isLast={i === total - 1}
            onPrev={goPrev}
            onNext={goNext}
            onStart={finish}
          />
        ))}
      </div>
    </div>
  );
}
