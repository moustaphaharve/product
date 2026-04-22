import type { FastifyInstance } from "fastify";
import { prisma } from "../prisma";
import { resolveUser } from "../auth";

/**
 * Produces a simple JSON export bundle (BOM + firmware + instructions).
 * In production this would return a ZIP; for this build we return JSON
 * so the desktop app can zip it client-side without a heavy dep.
 */
export async function exportRoutes(app: FastifyInstance) {
  app.get<{ Params: { id: string } }>(
    "/projects/:id/export",
    async (req, reply) => {
      const user = await resolveUser(req);
      const project = await prisma.project.findFirst({
        where: { id: req.params.id, userId: user.id },
        include: { messages: { orderBy: { createdAt: "asc" } } },
      });
      if (!project) return reply.notFound();

      const state = project.state as Record<string, unknown>;
      const selectedIds = (state?.selectedComponentIds as string[]) ?? [];
      const components = selectedIds.length
        ? await prisma.component.findMany({
            where: { id: { in: selectedIds } },
            include: { suppliers: true },
          })
        : [];

      interface BomRow {
        suppliers: Array<{ priceUsd: number; purchaseUrl: string; name: string }>;
        name: string;
        manufacturer: string;
        category: string;
      }
      const bom = (components as unknown as BomRow[]).map((c) => {
        const cheapest = [...c.suppliers].sort(
          (a, b) => a.priceUsd - b.priceUsd,
        )[0];
        return {
          name: c.name,
          manufacturer: c.manufacturer,
          category: c.category,
          priceUsd: cheapest?.priceUsd ?? null,
          purchaseUrl: cheapest?.purchaseUrl ?? null,
        };
      });

      return {
        project: {
          id: project.id,
          name: project.name,
          description: project.description,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
        },
        bom,
        firmware: (state?.firmwareCode as string) ?? "",
        simulation: (state?.simulationConfig as string) ?? "",
        assemblyInstructions: [
          "1. Lay out all parts per the BOM and verify quantities.",
          "2. Assemble the chassis per the selected chassis entry.",
          "3. Mount actuators to their placements from the robot spec.",
          "4. Wire power through the PDB; confirm polarity before powering on.",
          "5. Flash the generated firmware onto the selected controller.",
          "6. Bring up the robot off the ground; test actuators individually.",
          "7. Re-run the simulation alongside the physical robot and tune.",
        ],
      };
    },
  );
}
