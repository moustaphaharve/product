import { z } from "zod";

export const componentCategorySchema = z.enum([
  "MOTOR",
  "MICROCONTROLLER",
  "SENSOR",
  "CHASSIS",
  "WHEEL",
  "BATTERY",
  "ARM",
  "GRIPPER",
  "CABLE",
  "CONNECTOR",
  "MISC",
]);

export type ComponentCategory = z.infer<typeof componentCategorySchema>;

export const supplierSchema = z.object({
  id: z.string(),
  name: z.string(),
  priceUsd: z.number(),
  inStock: z.boolean(),
  leadTimeDays: z.number().int(),
  purchaseUrl: z.string().url(),
  affiliateUrl: z.string().url().nullable().optional(),
  lastChecked: z.string(),
});

export type Supplier = z.infer<typeof supplierSchema>;

export const componentSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  manufacturer: z.string(),
  category: componentCategorySchema,
  subcategory: z.string().nullable().optional(),
  description: z.string(),
  specs: z.record(z.unknown()),
  compatibility: z.record(z.unknown()),
  suppliers: z.array(supplierSchema),
  alternativeIds: z.array(z.string()).default([]),
  imageUrl: z.string().nullable().optional(),
  datasheetUrl: z.string().nullable().optional(),
});

export type Component = z.infer<typeof componentSchema>;
