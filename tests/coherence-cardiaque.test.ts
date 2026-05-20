import { describe, expect, it } from "vitest";
import {
  COHERENCE_CARDIAQUE,
  phaseAt,
} from "@/lib/exercises/coherence-cardiaque";

const cfg = COHERENCE_CARDIAQUE;
const CYCLE_MS = (cfg.inhaleSeconds + cfg.exhaleSeconds) * 1000;

describe("phaseAt", () => {
  it("starts in inhale at t=0", () => {
    const r = phaseAt(0, cfg);
    expect(r.phase).toBe("inhale");
    expect(r.cycleIndex).toBe(0);
  });

  it("switches to exhale at the inhale boundary", () => {
    const r = phaseAt(cfg.inhaleSeconds * 1000, cfg);
    expect(r.phase).toBe("exhale");
    expect(r.cycleIndex).toBe(0);
  });

  it("starts next cycle after a full cycle", () => {
    const r = phaseAt(CYCLE_MS, cfg);
    expect(r.phase).toBe("inhale");
    expect(r.cycleIndex).toBe(1);
  });

  it("computes progress within phase", () => {
    const r = phaseAt((cfg.inhaleSeconds * 1000) / 2, cfg);
    expect(r.phase).toBe("inhale");
    expect(r.progress).toBeCloseTo(0.5, 2);
  });

  it("handles negative elapsed defensively", () => {
    const r = phaseAt(-100, cfg);
    expect(r.phase).toBe("inhale");
    expect(r.cycleIndex).toBe(0);
  });

  it("computes 30 cycles over 5 minutes at 6/min", () => {
    const total = cfg.defaultDurationSeconds * 1000;
    const cycles = Math.floor(total / CYCLE_MS);
    expect(cycles).toBe(30);
  });
});
