import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../prisma";
import { resolveUser } from "../auth";

const updateSettingsBody = z.object({
  theme: z.enum(["dark", "light", "system"]).optional(),
  language: z.string().optional(),
  aiPreference: z.enum(["auto", "prefer_speed", "prefer_quality"]).optional(),
  simulationFidelity: z.enum(["fast", "balanced", "high"]).optional(),
  defaultEnvironment: z
    .enum(["empty", "warehouse", "outdoor_path", "tabletop", "flight_space"])
    .optional(),
  preferredSuppliers: z.array(z.string()).optional(),
  region: z.string().optional(),
  telemetryOptIn: z.boolean().optional(),
  privacyMode: z.boolean().optional(),
  customShortcuts: z.record(z.string()).optional(),
  experimentalFeatures: z.array(z.string()).optional(),
});

export async function settingsRoutes(app: FastifyInstance) {
  app.get("/settings", async (req) => {
    const user = await resolveUser(req);
    const settings = await prisma.userSettings.upsert({
      where: { userId: user.id },
      create: { userId: user.id },
      update: {},
    });
    return { settings };
  });

  app.patch("/settings", async (req) => {
    const user = await resolveUser(req);
    const body = updateSettingsBody.parse(req.body);
    const settings = await prisma.userSettings.upsert({
      where: { userId: user.id },
      create: { userId: user.id, ...body },
      update: body,
    });
    return { settings };
  });

  app.get("/credits", async (req) => {
    const user = await resolveUser(req);
    const credits = await prisma.userCredits.findUnique({
      where: { userId: user.id },
    });
    return { credits };
  });

  app.get("/account", async (req) => {
    const user = await resolveUser(req);
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        createdAt: true,
      },
    });
    return { user: dbUser };
  });
}
