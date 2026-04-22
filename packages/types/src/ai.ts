import { z } from "zod";

export const intentSchema = z.enum([
  "generate_new_robot",
  "modify_existing",
  "test_scenario",
  "ask_question",
  "export",
]);
export type Intent = z.infer<typeof intentSchema>;

export const intentClassificationSchema = z.object({
  intent: intentSchema,
  confidence: z.number().min(0).max(1),
  reason: z.string().default(""),
});

export const aiModelIdSchema = z.enum([
  "claude-haiku-4-5",
  "claude-sonnet-4-6",
  "claude-opus-4-6",
]);
export type AIModelId = z.infer<typeof aiModelIdSchema>;

export const aiCallRecordSchema = z.object({
  id: z.string(),
  projectId: z.string().nullable(),
  userId: z.string(),
  model: aiModelIdSchema,
  inputTokens: z.number().int(),
  outputTokens: z.number().int(),
  cachedTokens: z.number().int().default(0),
  latencyMs: z.number().int(),
  costUsd: z.number(),
  purpose: z.enum([
    "intent",
    "spec",
    "components",
    "simulation",
    "firmware",
    "validation",
  ]),
  createdAt: z.string(),
});

export type AICallRecord = z.infer<typeof aiCallRecordSchema>;

export const streamEventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("status"),
    label: z.string(),
    phase: z.string(),
  }),
  z.object({ type: z.literal("delta"), text: z.string() }),
  z.object({ type: z.literal("step_complete"), label: z.string() }),
  z.object({
    type: z.literal("artifact"),
    name: z.string(),
    payload: z.unknown(),
  }),
  z.object({ type: z.literal("done") }),
  z.object({ type: z.literal("error"), message: z.string() }),
]);

export type StreamEvent = z.infer<typeof streamEventSchema>;
