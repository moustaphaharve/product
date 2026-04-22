import type { FastifyInstance } from "fastify";
import { healthRoutes } from "./health";
import { projectRoutes } from "./projects";
import { settingsRoutes } from "./settings";
import { componentRoutes } from "./components";
import { chatRoutes } from "./chat";
import { exportRoutes } from "./export";

export async function registerRoutes(app: FastifyInstance) {
  await app.register(healthRoutes, { prefix: "/v1" });
  await app.register(projectRoutes, { prefix: "/v1" });
  await app.register(settingsRoutes, { prefix: "/v1" });
  await app.register(componentRoutes, { prefix: "/v1" });
  await app.register(chatRoutes, { prefix: "/v1" });
  await app.register(exportRoutes, { prefix: "/v1" });
}
