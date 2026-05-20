"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BreathingCircle } from "./BreathingCircle";
import {
  COHERENCE_CARDIAQUE,
  phaseAt,
} from "@/lib/exercises/coherence-cardiaque";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import { logBreathingSession } from "@/app/exercices/coherence-cardiaque/actions";

type Status = "idle" | "running" | "paused" | "done";

const DURATION_MS = COHERENCE_CARDIAQUE.defaultDurationSeconds * 1000;
const CYCLE_SECONDS =
  COHERENCE_CARDIAQUE.inhaleSeconds + COHERENCE_CARDIAQUE.exhaleSeconds;

function formatTime(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

export function BreathingSession() {
  const reducedMotion = usePrefersReducedMotion();
  const [status, setStatus] = useState<Status>("idle");
  const [elapsedMs, setElapsedMs] = useState(0);
  const startRef = useRef<number | null>(null);
  const accumRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const stopRaf = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const tick = useCallback(() => {
    if (startRef.current === null) return;
    const now = performance.now();
    const elapsed = accumRef.current + (now - startRef.current);
    if (elapsed >= DURATION_MS) {
      setElapsedMs(DURATION_MS);
      setStatus("done");
      return;
    }
    setElapsedMs(elapsed);
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const start = useCallback(() => {
    accumRef.current = 0;
    startRef.current = performance.now();
    setElapsedMs(0);
    setStatus("running");
  }, []);

  const pause = useCallback(() => {
    if (status !== "running") return;
    stopRaf();
    if (startRef.current !== null) {
      accumRef.current += performance.now() - startRef.current;
      startRef.current = null;
    }
    setStatus("paused");
  }, [status]);

  const resume = useCallback(() => {
    if (status !== "paused") return;
    startRef.current = performance.now();
    setStatus("running");
  }, [status]);

  const stop = useCallback(() => {
    stopRaf();
    startRef.current = null;
    accumRef.current = 0;
    setElapsedMs(0);
    setStatus("idle");
  }, []);

  useEffect(() => {
    if (status === "running") {
      rafRef.current = requestAnimationFrame(tick);
    }
    return () => {
      stopRaf();
    };
  }, [status, tick]);

  useEffect(() => {
    if (status !== "done") return;
    const cycles = Math.floor(DURATION_MS / 1000 / CYCLE_SECONDS);
    void logBreathingSession({
      duration_seconds: Math.floor(DURATION_MS / 1000),
      completed_cycles: cycles,
    }).catch(() => {
      /* anonymous user or supabase not configured — no-op */
    });
  }, [status]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "p" || e.key === "P") {
        if (status === "running" || status === "paused") {
          e.preventDefault();
          if (status === "running") pause();
          else resume();
        }
      }
      if (
        e.key === "Escape" &&
        (status === "running" || status === "paused")
      ) {
        e.preventDefault();
        stop();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [status, pause, resume, stop]);

  const info = phaseAt(elapsedMs, COHERENCE_CARDIAQUE);
  const phaseDisplay: "idle" | "inhale" | "exhale" =
    status === "running" || status === "paused" ? info.phase : "idle";
  const remainingMs = Math.max(0, DURATION_MS - elapsedMs);

  if (status === "idle") {
    return (
      <div className="space-y-6">
        <p className="text-neutral-700">
          La cohérence cardiaque est une pratique de respiration consciente à
          6 cycles par minute, reconnue comme un outil d&rsquo;auto-régulation
          du stress. Elle ne remplace pas un suivi médical.
        </p>
        <ul className="space-y-1 text-sm text-neutral-600">
          <li>· Durée : 5 minutes</li>
          <li>· Rythme : 5 s inspire / 5 s expire</li>
          <li>
            · Pause : <kbd className="rounded border px-1">Espace</kbd> ·
            Arrêt : <kbd className="rounded border px-1">Échap</kbd>
          </li>
        </ul>
        <button
          type="button"
          onClick={start}
          className="rounded-full bg-blue-900 px-8 py-3 text-base font-medium text-white hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900"
        >
          Commencer
        </button>
      </div>
    );
  }

  if (status === "done") {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Séance terminée</h2>
        <p className="text-neutral-700">
          Prends un instant pour observer ce qui a changé. Pas de score, pas de
          pression.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={start}
            className="min-h-[44px] rounded-full bg-blue-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900"
          >
            Recommencer
          </button>
          <button
            type="button"
            onClick={stop}
            className="min-h-[44px] rounded-full border border-neutral-300 px-6 py-2.5 text-sm font-medium hover:bg-neutral-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-8">
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {status === "paused"
          ? "En pause"
          : phaseDisplay === "inhale"
            ? "Inspire"
            : "Expire"}
      </div>
      <BreathingCircle phase={phaseDisplay} reducedMotion={reducedMotion} />
      <p
        className="text-3xl font-light tabular-nums text-neutral-700"
        aria-label={`Temps restant ${formatTime(remainingMs)}`}
      >
        {formatTime(remainingMs)}
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        {status === "running" ? (
          <button
            type="button"
            onClick={pause}
            className="min-h-[44px] rounded-full border border-neutral-300 px-6 py-2.5 text-sm font-medium hover:bg-neutral-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900"
          >
            Pause
          </button>
        ) : (
          <button
            type="button"
            onClick={resume}
            className="min-h-[44px] rounded-full bg-blue-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900"
          >
            Reprendre
          </button>
        )}
        <button
          type="button"
          onClick={stop}
          className="min-h-[44px] rounded-full border border-neutral-300 px-6 py-2.5 text-sm font-medium hover:bg-neutral-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900"
        >
          Arrêter
        </button>
      </div>
    </div>
  );
}
