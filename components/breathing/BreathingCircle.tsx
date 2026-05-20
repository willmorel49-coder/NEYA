import { COHERENCE_CARDIAQUE } from "@/lib/exercises/coherence-cardiaque";

type Props = {
  phase: "idle" | "inhale" | "exhale";
  reducedMotion: boolean;
};

export function BreathingCircle({ phase, reducedMotion }: Props) {
  if (reducedMotion) {
    return (
      <div
        className="flex h-64 w-64 items-center justify-center rounded-full bg-blue-50 ring-1 ring-blue-200"
        aria-hidden="true"
      >
        <span className="text-3xl font-light text-blue-900">
          {phase === "inhale" ? "Inspire" : phase === "exhale" ? "Expire" : "Prêt ?"}
        </span>
      </div>
    );
  }

  const duration =
    phase === "inhale"
      ? COHERENCE_CARDIAQUE.inhaleSeconds
      : phase === "exhale"
        ? COHERENCE_CARDIAQUE.exhaleSeconds
        : 0;

  const transform =
    phase === "inhale"
      ? "scale(1)"
      : phase === "exhale"
        ? "scale(0.55)"
        : "scale(0.75)";

  return (
    <div
      className="relative flex h-72 w-72 items-center justify-center"
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 rounded-full bg-blue-100 transition-transform ease-in-out"
        style={{ transform, transitionDuration: `${duration}s` }}
      />
      <span className="relative text-3xl font-light tracking-wide text-blue-900">
        {phase === "inhale" ? "Inspire" : phase === "exhale" ? "Expire" : ""}
      </span>
    </div>
  );
}
