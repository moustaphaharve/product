import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../prisma";

const query = z.object({
  category: z
    .enum([
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
    ])
    .optional(),
  search: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(500).default(100),
});

export async function componentRoutes(app: FastifyInstance) {
  app.get("/components", async (req) => {
    const q = query.parse(req.query);
    const components = await prisma.component.findMany({
      where: {
        category: q.category,
        OR: q.search
          ? [
              { name: { contains: q.search, mode: "insensitive" } },
              { manufacturer: { contains: q.search, mode: "insensitive" } },
              { description: { contains: q.search, mode: "insensitive" } },
            ]
          : undefined,
      },
      include: { suppliers: true },
      take: q.limit,
      orderBy: { name: "asc" },
    });
    return { components };
  });

  app.get<{ Params: { slug: string } }>(
    "/components/:slug",
    async (req, reply) => {
      const c = await prisma.component.findUnique({
        where: { slug: req.params.slug },
        include: { suppliers: true },
      });
      if (!c) return reply.notFound();
      return { component: c };
    },
  );
}
