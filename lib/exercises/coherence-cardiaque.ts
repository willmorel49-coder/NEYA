export const COHERENCE_CARDIAQUE = {
  inhaleSeconds: 5,
  exhaleSeconds: 5,
  defaultDurationSeconds: 5 * 60,
  breathsPerMinute: 6,
} as const;

export type BreathingConfig = {
  inhaleSeconds: number;
  exhaleSeconds: number;
};

export type BreathingPhase = "inhale" | "exhale";

export type BreathingPhaseInfo = {
  phase: BreathingPhase;
  cycleIndex: number;
  progress: number;
  secondsLeft: number;
};

export function phaseAt(
  elapsedMs: number,
  cfg: BreathingConfig,
): BreathingPhaseInfo {
  const inhaleMs = cfg.inhaleSeconds * 1000;
  const exhaleMs = cfg.exhaleSeconds * 1000;
  const cycleMs = inhaleMs + exhaleMs;
  const safeElapsed = Math.max(0, elapsedMs);
  const cycleIndex = Math.floor(safeElapsed / cycleMs);
  const inCycle = safeElapsed % cycleMs;

  if (inCycle < inhaleMs) {
    return {
      phase: "inhale",
      cycleIndex,
      progress: inhaleMs === 0 ? 0 : inCycle / inhaleMs,
      secondsLeft: Math.max(1, cfg.inhaleSeconds - Math.floor(inCycle / 1000)),
    };
  }
  const inExhale = inCycle - inhaleMs;
  return {
    phase: "exhale",
    cycleIndex,
    progress: exhaleMs === 0 ? 0 : inExhale / exhaleMs,
    secondsLeft: Math.max(1, cfg.exhaleSeconds - Math.floor(inExhale / 1000)),
  };
}
