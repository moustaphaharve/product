import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../prisma";
import { resolveUser } from "../auth";

const createProjectBody = z.object({
  name: z.string().min(1).max(120),
  description: z.string().default(""),
  initialPrompt: z.string().optional(),
});

const updateProjectBody = z.object({
  name: z.string().min(1).max(120).optional(),
  description: z.string().optional(),
  starred: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  state: z.unknown().optional(),
});

export async function projectRoutes(app: FastifyInstance) {
  app.get("/projects", async (req) => {
    const user = await resolveUser(req);
    const projects = await prisma.project.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        name: true,
        description: true,
        thumbnailUrl: true,
        createdAt: true,
        updatedAt: true,
        archivedAt: true,
        starred: true,
        tags: true,
      },
    });
    return { projects };
  });

  app.get<{ Params: { id: string } }>(
    "/projects/:id",
    async (req, reply) => {
      const user = await resolveUser(req);
      const project = await prisma.project.findFirst({
        where: { id: req.params.id, userId: user.id },
        include: {
          versions: {
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              projectId: true,
              label: true,
              snapshotType: true,
              createdAt: true,
            },
          },
        },
      });
      if (!project) return reply.notFound();
      // Flatten state onto the project shape the desktop client expects.
      const state = (project.state as Record<string, unknown>) ?? {};
      return {
        project: {
          id: project.id,
          userId: project.userId,
          name: project.name,
          description: project.description,
          thumbnailUrl: project.thumbnailUrl,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
          archivedAt: project.archivedAt,
          starred: project.starred,
          tags: project.tags,
          conversation: state.conversation ?? [],
          robotSpec: state.robotSpec ?? null,
          selectedComponentIds: state.selectedComponentIds ?? [],
          simulationConfig: state.simulationConfig ?? "",
          firmwareCode: state.firmwareCode ?? "",
          environment: state.environment ?? "empty",
          versions: project.versions,
        },
      };
    },
  );

  app.post("/projects", async (req) => {
    const user = await resolveUser(req);
    const body = createProjectBody.parse(req.body);
    const name =
      body.name || (body.initialPrompt?.slice(0, 48) ?? "Untitled project");
    const project = await prisma.project.create({
      data: {
        userId: user.id,
        name,
        description: body.description,
        tags: [],
        state: {
          conversation: body.initialPrompt
            ? [
                {
                  id: crypto.randomUUID(),
                  role: "user",
                  content: body.initialPrompt,
                  timestamp: new Date().toISOString(),
                },
              ]
            : [],
          robotSpec: null,
          selectedComponentIds: [],
          simulationConfig: "",
          firmwareCode: "",
          environment: "empty",
        },
      },
    });
    return { project };
  });

  app.patch<{ Params: { id: string } }>(
    "/projects/:id",
    async (req, reply) => {
      const user = await resolveUser(req);
      const body = updateProjectBody.parse(req.body);
      const existing = await prisma.project.findFirst({
        where: { id: req.params.id, userId: user.id },
      });
      if (!existing) return reply.notFound();
      const updated = await prisma.project.update({
        where: { id: existing.id },
        data: {
          name: body.name ?? undefined,
          description: body.description ?? undefined,
          starred: body.starred ?? undefined,
          tags: body.tags ?? undefined,
          state: body.state !== undefined ? (body.state as object) : undefined,
        },
      });
      return { project: updated };
    },
  );

  app.post<{ Params: { id: string } }>(
    "/projects/:id/duplicate",
    async (req, reply) => {
      const user = await resolveUser(req);
      const src = await prisma.project.findFirst({
        where: { id: req.params.id, userId: user.id },
      });
      if (!src) return reply.notFound();
      const dup = await prisma.project.create({
        data: {
          userId: user.id,
          name: `${src.name} (copy)`,
          description: src.description,
          tags: src.tags,
          state: src.state as object,
        },
      });
      return { project: dup };
    },
  );

  app.post<{ Params: { id: string } }>(
    "/projects/:id/archive",
    async (req, reply) => {
      const user = await resolveUser(req);
      const existing = await prisma.project.findFirst({
        where: { id: req.params.id, userId: user.id },
      });
      if (!existing) return reply.notFound();
      const updated = await prisma.project.update({
        where: { id: existing.id },
        data: { archivedAt: existing.archivedAt ? null : new Date() },
      });
      return { project: updated };
    },
  );

  app.delete<{ Params: { id: string } }>(
    "/projects/:id",
    async (req, reply) => {
      const user = await resolveUser(req);
      const existing = await prisma.project.findFirst({
        where: { id: req.params.id, userId: user.id },
      });
      if (!existing) return reply.notFound();
      await prisma.project.delete({ where: { id: existing.id } });
      return { ok: true };
    },
  );

  app.post<{ Params: { id: string } }>(
    "/projects/:id/versions",
    async (req, reply) => {
      const user = await resolveUser(req);
      const body = z
        .object({
          label: z.string().default("Snapshot"),
          snapshotType: z.enum(["auto", "manual"]).default("manual"),
        })
        .parse(req.body ?? {});
      const existing = await prisma.project.findFirst({
        where: { id: req.params.id, userId: user.id },
      });
      if (!existing) return reply.notFound();
      const version = await prisma.projectVersion.create({
        data: {
          projectId: existing.id,
          label: body.label,
          snapshotType: body.snapshotType,
          state: existing.state as object,
        },
      });
      return { version };
    },
  );

  app.post<{ Params: { id: string; versionId: string } }>(
    "/projects/:id/versions/:versionId/restore",
    async (req, reply) => {
      const user = await resolveUser(req);
      const version = await prisma.projectVersion.findFirst({
        where: { id: req.params.versionId, projectId: req.params.id },
      });
      if (!version) return reply.notFound();
      const project = await prisma.project.findFirst({
        where: { id: req.params.id, userId: user.id },
      });
      if (!project) return reply.notFound();
      const restored = await prisma.project.update({
        where: { id: project.id },
        data: { state: version.state as object },
      });
      return { project: restored };
    },
  );
}
