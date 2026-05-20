"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const InputSchema = z.object({
  duration_seconds: z
    .number()
    .int()
    .min(0)
    .max(60 * 60),
  completed_cycles: z.number().int().min(0).max(1000),
});

type Result =
  | { ok: true }
  | { ok: false; reason: "invalid_input" | "anonymous" | "insert_failed" | "not_configured" };

export async function logBreathingSession(raw: unknown): Promise<Result> {
  const parsed = InputSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, reason: "invalid_input" };

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { ok: false, reason: "not_configured" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, reason: "anonymous" };

  const { error } = await supabase.from("breathing_sessions").insert({
    user_id: user.id,
    completed_at: new Date().toISOString(),
    duration_seconds: parsed.data.duration_seconds,
    completed_cycles: parsed.data.completed_cycles,
  });

  if (error) {
    console.error("[breathing_sessions] insert error");
    return { ok: false, reason: "insert_failed" };
  }
  return { ok: true };
}
