import { z } from "zod";
import { robotSpecSchema } from "./robot";
import { environmentTypeSchema } from "./environment";

export const messageRoleSchema = z.enum(["user", "assistant", "system"]);

export const activityStepSchema = z.object({
  label: z.string(),
  completedAt: z.string().nullable(),
});

export const activityStatusSchema = z.enum([
  "thinking",
  "generating",
  "complete",
  "error",
]);

export const messageActivitySchema = z.object({
  status: activityStatusSchema,
  label: z.string(),
  steps: z.array(activityStepSchema),
  elapsedMs: z.number().optional(),
  errorMessage: z.string().optional(),
});

export const messageArtifactsSchema = z.object({
  specChanges: robotSpecSchema.partial().optional(),
  componentChanges: z
    .object({
      added: z.array(z.string()),
      removed: z.array(z.string()),
    })
    .optional(),
  firmwareChanges: z.boolean().optional(),
  simulationChanges: z.boolean().optional(),
});

export const messageSchema = z.object({
  id: z.string(),
  role: messageRoleSchema,
  content: z.string(),
  timestamp: z.string(),
  activity: messageActivitySchema.nullable().optional(),
  artifacts: messageArtifactsSchema.nullable().optional(),
});

export type Message = z.infer<typeof messageSchema>;
export type MessageActivity = z.infer<typeof messageActivitySchema>;

export const projectVersionSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  createdAt: z.string(),
  snapshotType: z.enum(["auto", "manual"]),
  label: z.string(),
});

export type ProjectVersion = z.infer<typeof projectVersionSchema>;

export const projectSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  description: z.string(),
  thumbnailUrl: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  archivedAt: z.string().nullable(),
  starred: z.boolean(),
  tags: z.array(z.string()),

  conversation: z.array(messageSchema),
  robotSpec: robotSpecSchema.nullable(),
  selectedComponentIds: z.array(z.string()),
  simulationConfig: z.string(),
  firmwareCode: z.string(),
  environment: environmentTypeSchema,

  versions: z.array(projectVersionSchema).default([]),
});

export type Project = z.infer<typeof projectSchema>;

export const projectSummarySchema = projectSchema.pick({
  id: true,
  name: true,
  description: true,
  thumbnailUrl: true,
  createdAt: true,
  updatedAt: true,
  archivedAt: true,
  starred: true,
  tags: true,
});

export type ProjectSummary = z.infer<typeof projectSummarySchema>;
