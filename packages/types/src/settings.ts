import { z } from "zod";
import { environmentTypeSchema } from "./environment";

export const themeSchema = z.enum(["dark", "light", "system"]);
export const aiPreferenceSchema = z.enum([
  "auto",
  "prefer_speed",
  "prefer_quality",
]);
export const simulationFidelitySchema = z.enum(["fast", "balanced", "high"]);

export const userSettingsSchema = z.object({
  userId: z.string(),
  theme: themeSchema.default("dark"),
  language: z.string().default("en"),
  aiPreference: aiPreferenceSchema.default("auto"),
  simulationFidelity: simulationFidelitySchema.default("balanced"),
  defaultEnvironment: environmentTypeSchema.default("empty"),
  preferredSuppliers: z.array(z.string()).default([]),
  region: z.string().default("US"),
  telemetryOptIn: z.boolean().default(true),
  privacyMode: z.boolean().default(false),
  customShortcuts: z.record(z.string()).default({}),
  experimentalFeatures: z.array(z.string()).default([]),
});

export type UserSettings = z.infer<typeof userSettingsSchema>;

export const userCreditsSchema = z.object({
  userId: z.string(),
  planId: z.string(),
  creditsIncluded: z.number().int(),
  creditsUsedThisPeriod: z.number().int(),
  periodStart: z.string(),
  periodEnd: z.string(),
  overageCreditsUsed: z.number().int(),
  overageChargesUsd: z.number(),
});

export type UserCredits = z.infer<typeof userCreditsSchema>;
