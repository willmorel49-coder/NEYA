import type { Metadata } from "next";
import { BreathingSession } from "@/components/breathing/BreathingSession";

export const metadata: Metadata = {
  title: "Cohérence cardiaque · NEYA",
  description: "5 minutes pour ralentir, à 6 cycles par minute.",
};

export default function Page() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col px-6 py-12">
      <header>
        <p className="text-sm uppercase tracking-wide text-neutral-500">
          Exercice de respiration
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          Cohérence cardiaque
        </h1>
      </header>

      <div className="mt-10 flex-1">
        <BreathingSession />
      </div>

      <footer className="mt-12 border-t border-neutral-200 pt-6 text-sm text-neutral-500">
        <p>
          En cas de détresse, le{" "}
          <a
            href="tel:3114"
            className="font-medium text-neutral-700 underline underline-offset-4"
          >
            3114
          </a>{" "}
          (Numéro national de prévention du suicide) est joignable 24/7,
          gratuitement et anonymement.
        </p>
      </footer>
    </main>
  );
}
