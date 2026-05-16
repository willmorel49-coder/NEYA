import styles from './onboarding.module.css';

export default function ProgressDots({ total, active }) {
  return (
    <div
      className={styles.dots}
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={active + 1}
      aria-label={`Étape ${active + 1} sur ${total}`}
    >
      {Array.from({ length: total }).map((_, i) => {
        const cls = [
          styles.dot,
          i === active ? styles.dotActive : '',
          i < active ? styles.dotDone : '',
        ]
          .filter(Boolean)
          .join(' ');
        return <span key={i} className={cls} />;
      })}
    </div>
  );
}
