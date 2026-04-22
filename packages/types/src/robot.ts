import { z } from "zod";
import { environmentTypeSchema } from "./environment";

export const robotCategorySchema = z.enum([
  "mobile_ground",
  "mobile_aerial",
  "manipulator_arm",
  "humanoid",
  "quadruped",
  "wheeled_platform",
  "tracked_platform",
  "custom",
]);

export type RobotCategory = z.infer<typeof robotCategorySchema>;

export const actuatorSchema = z.object({
  id: z.string(),
  role: z.string(),
  componentId: z.string().nullable(),
  placement: z.string().optional(),
});

export const sensorSchema = z.object({
  id: z.string(),
  role: z.string(),
  componentId: z.string().nullable(),
  placement: z.string().optional(),
});

export const structureSchema = z.object({
  chassisComponentId: z.string().nullable(),
  dimensionsMm: z
    .object({
      length: z.number(),
      width: z.number(),
      height: z.number(),
    })
    .optional(),
  weightKg: z.number().optional(),
});

export const powerSchema = z.object({
  batteryComponentId: z.string().nullable(),
  expectedRuntimeMinutes: z.number().optional(),
});

export const robotSpecSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: robotCategorySchema,
  summary: z.string(),
  environment: environmentTypeSchema,
  structure: structureSchema,
  power: powerSchema,
  controller: z.object({
    componentId: z.string().nullable(),
  }),
  actuators: z.array(actuatorSchema),
  sensors: z.array(sensorSchema),
  objectives: z.array(z.string()),
  constraints: z.array(z.string()).default([]),
  notes: z.string().default(""),
});

export type RobotSpec = z.infer<typeof robotSpecSchema>;
