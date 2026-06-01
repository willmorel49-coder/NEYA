/* ============================================================
   StarField — SVG constellation responsive
   ============================================================
   Props :
     stars       : array d'étoiles {id, date, color, ...}
     todayStar   : étoile d'aujourd'hui (peut être null = dashed)
     onTapToday  : fn pour poser l'étoile (si todayStar null)
     onTapStar   : fn(star) pour rouvrir une étoile
     userId      : pour placement déterministe
============================================================ */

import { useMemo } from 'react';
import Star from './Star';
import { positionForStar, generateConnections } from '../../v2/data/star-positions';

const MAX_STARS = 200;

export default function StarField({ stars, todayStar, onTapToday, onTapStar, userId }) {
  // Limite à 200 étoiles (LRU des plus récentes) pour perf mobile
  const limited = useMemo(() => {
    if (!stars || stars.length <= MAX_STARS) return stars || [];
    return [...stars].slice(-MAX_STARS);
  }, [stars]);

  const connections = useMemo(() => generateConnections(limited, userId), [limited, userId]);

  // Position de l'étoile d'aujourd'hui (id fictif si non posée)
  const todayPos = useMemo(() => {
    const id = todayStar?.id || `today-${new Date().toISOString().split('T')[0]}`;
    return positionForStar(id, userId);
  }, [todayStar, userId]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: 280,
      }}
    >
      {/* Fils SVG (connexions intra-semaine) */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      >
        {connections.map((c, i) => (
          <line
            key={i}
            x1={c.from.x}
            y1={c.from.y}
            x2={c.to.x}
            y2={c.to.y}
            stroke="rgba(255,255,255,0.20)"
            strokeWidth="0.15"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>

      {/* Étoiles passées */}
      {limited.map((star) => {
        // Priorité aux positions persistées (constellation stable même si userId regénéré)
        const pos = (star.x != null && star.y != null)
          ? { x: star.x, y: star.y }
          : positionForStar(star.id, userId);
        return (
          <Star
            key={star.id}
            color={star.color}
            size={4}
            pulse={false}
            onTap={onTapStar ? () => onTapStar(star) : undefined}
            ariaLabel={`Étoile du ${star.date}`}
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          />
        );
      })}

      {/* Étoile d'aujourd'hui (au-dessus) */}
      <Star
        color={todayStar?.color || 'bleu'}
        size={todayStar ? 9 : 12}
        pulse={true}
        glow={!!todayStar}
        dashed={!todayStar}
        onTap={!todayStar ? onTapToday : undefined}
        ariaLabel={todayStar ? "Ton étoile d'aujourd'hui" : 'Pose ton étoile'}
        style={{ left: `${todayPos.x}%`, top: `${todayPos.y}%` }}
      />

      {/* Label "aujourd'hui" si non posée */}
      {!todayStar && (
        <div
          style={{
            position: 'absolute',
            left: `${todayPos.x}%`,
            top: `${todayPos.y}%`,
            transform: 'translate(-50%, calc(-50% - 24px))',
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 9,
            fontWeight: 600,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.7)',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}
        >
          aujourd'hui
        </div>
      )}
    </div>
  );
}
