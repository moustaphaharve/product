import type { AIModelId } from "@product/types";

/**
 * Model routing. The exact Anthropic model IDs are kept in one place.
 *
 * When the user's `aiPreference` is `prefer_speed` we bias toward Haiku;
 * `prefer_quality` biases to Opus; `auto` uses the default per-purpose.
 */
export const MODEL_IDS: Record<AIModelId, string> = {
  "claude-haiku-4-5": "claude-haiku-4-5",
  "claude-sonnet-4-6": "claude-sonnet-4-6",
  "claude-opus-4-6": "claude-opus-4-6",
};

/** Approximate $/1M tokens for cost accounting. Adjust as pricing evolves. */
export const MODEL_COSTS: Record<
  AIModelId,
  { inputPerM: number; outputPerM: number; cachedInputPerM: number }
> = {
  "claude-haiku-4-5": { inputPerM: 1.0, outputPerM: 5.0, cachedInputPerM: 0.1 },
  "claude-sonnet-4-6": { inputPerM: 3.0, outputPerM: 15.0, cachedInputPerM: 0.3 },
  "claude-opus-4-6": { inputPerM: 15.0, outputPerM: 75.0, cachedInputPerM: 1.5 },
};

export function estimateCostUsd(
  model: AIModelId,
  inputTokens: number,
  outputTokens: number,
  cachedTokens = 0,
): number {
  const m = MODEL_COSTS[model];
  const freshInput = Math.max(inputTokens - cachedTokens, 0);
  return (
    (freshInput * m.inputPerM) / 1_000_000 +
    (cachedTokens * m.cachedInputPerM) / 1_000_000 +
    (outputTokens * m.outputPerM) / 1_000_000
  );
}

export type AIPreference = "auto" | "prefer_speed" | "prefer_quality";
export type Purpose =
  | "intent"
  | "spec"
  | "components"
  | "simulation"
  | "firmware"
  | "validation";

const DEFAULT_ROUTING: Record<Purpose, AIModelId> = {
  intent: "claude-haiku-4-5",
  spec: "claude-sonnet-4-6",
  components: "claude-haiku-4-5",
  simulation: "claude-sonnet-4-6",
  firmware: "claude-sonnet-4-6",
  validation: "claude-haiku-4-5",
};

export function chooseModel(
  purpose: Purpose,
  preference: AIPreference = "auto",
): AIModelId {
  const base = DEFAULT_ROUTING[purpose];
  if (preference === "prefer_speed") return "claude-haiku-4-5";
  if (preference === "prefer_quality") {
    return purpose === "firmware" ? "claude-opus-4-6" : "claude-sonnet-4-6";
  }
  return base;
}
