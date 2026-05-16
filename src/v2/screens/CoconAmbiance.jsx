/* ============================================================
   CoconAmbiance — 5 animations atmosphériques pour le Cocon
   ============================================================
   Petites particules animées par-dessus le fond painterly.
   CSS pur, GPU-friendly (transform + opacity uniquement).

   Choix : 'fireflies' | 'rain' | 'snow' | 'stars' | 'none'
   ============================================================ */

import { useMemo } from 'react';

const FIREFLIES_COUNT = 8;
const RAIN_COUNT = 24;
const SNOW_COUNT = 22;
const STARS_COUNT = 18;

function makeFireflies() {
  return Array.from({ length: FIREFLIES_COUNT }, (_, i) => ({
    left: `${10 + Math.random() * 80}%`,
    top: `${15 + Math.random() * 70}%`,
    size: 3 + Math.random() * 3,
    delay: Math.random() * 4,
    duration: 6 + Math.random() * 4,
  }));
}

function makeRain() {
  return Array.from({ length: RAIN_COUNT }, () => ({
    left: `${Math.random() * 100}%`,
    delay: Math.random() * 4,
    duration: 1.2 + Math.random() * 0.8,
    height: 18 + Math.random() * 14,
    opacity: 0.25 + Math.random() * 0.25,
  }));
}

function makeSnow() {
  return Array.from({ length: SNOW_COUNT }, () => ({
    left: `${Math.random() * 100}%`,
    delay: Math.random() * 8,
    duration: 9 + Math.random() * 6,
    size: 2 + Math.random() * 3,
    drift: -10 + Math.random() * 20,
  }));
}

function makeStars() {
  return Array.from({ length: STARS_COUNT }, () => ({
    left: `${5 + Math.random() * 90}%`,
    top: `${5 + Math.random() * 75}%`,
    size: 1.5 + Math.random() * 1.5,
    delay: Math.random() * 6,
    duration: 3 + Math.random() * 4,
  }));
}

export default function CoconAmbiance({ type = 'fireflies', accent = '#FBF6E8' }) {
  const data = useMemo(() => {
    if (type === 'fireflies') return makeFireflies();
    if (type === 'rain')      return makeRain();
    if (type === 'snow')      return makeSnow();
    if (type === 'stars')     return makeStars();
    return null;
  }, [type]);

  if (!data || type === 'none') return null;

  if (type === 'fireflies') {
    return (
      <>
        {data.map((f, i) => (
          <span
            key={i}
            aria-hidden
            style={{
              position: 'absolute',
              left: f.left,
              top: f.top,
              width: f.size,
              height: f.size,
              borderRadius: '50%',
              background: '#FBF6E8',
              boxShadow: `0 0 ${f.size * 4}px ${f.size}px ${accent}`,
              opacity: 0,
              animation: `cocon-firefly ${f.duration}s ease-in-out ${f.delay}s infinite`,
              pointerEvents: 'none',
              willChange: 'transform, opacity',
            }}
          />
        ))}
      </>
    );
  }

  if (type === 'rain') {
    return (
      <>
        {data.map((r, i) => (
          <span
            key={i}
            aria-hidden
            style={{
              position: 'absolute',
              left: r.left,
              top: -30,
              width: 1,
              height: r.height,
              background: 'linear-gradient(180deg, transparent 0%, rgba(251, 246, 232, 0.7) 100%)',
              opacity: r.opacity,
              animation: `cocon-rain-fall ${r.duration}s linear ${r.delay}s infinite`,
              pointerEvents: 'none',
              willChange: 'transform',
            }}
          />
        ))}
      </>
    );
  }

  if (type === 'snow') {
    return (
      <>
        {data.map((s, i) => (
          <span
            key={i}
            aria-hidden
            style={{
              position: 'absolute',
              left: s.left,
              top: -20,
              width: s.size,
              height: s.size,
              borderRadius: '50%',
              background: '#FBF6E8',
              opacity: 0.75,
              boxShadow: '0 0 4px rgba(251, 246, 232, 0.5)',
              animation: `cocon-snow-fall ${s.duration}s linear ${s.delay}s infinite`,
              pointerEvents: 'none',
              willChange: 'transform, opacity',
              '--drift': `${s.drift}vw`,
            }}
          />
        ))}
      </>
    );
  }

  if (type === 'stars') {
    return (
      <>
        {data.map((s, i) => (
          <span
            key={i}
            aria-hidden
            style={{
              position: 'absolute',
              left: s.left,
              top: s.top,
              width: s.size,
              height: s.size,
              borderRadius: '50%',
              background: '#FBF6E8',
              boxShadow: `0 0 ${s.size * 6}px ${s.size * 2}px rgba(255, 255, 255, 0.78)`,
              opacity: 0,
              animation: `cocon-star-twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
              pointerEvents: 'none',
              willChange: 'opacity, transform',
            }}
          />
        ))}
      </>
    );
  }

  return null;
}
