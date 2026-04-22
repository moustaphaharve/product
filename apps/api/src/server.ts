import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import sensible from "@fastify/sensible";
import { logger } from "./logger";
import { registerRoutes } from "./routes";

async function main() {
  const app = Fastify({
    logger,
    disableRequestLogging: false,
  });

  await app.register(cors, { origin: true, credentials: true });
  await app.register(sensible);

  await registerRoutes(app);

  const port = Number(process.env.PORT ?? 4000);
  await app.listen({ port, host: "0.0.0.0" });
  app.log.info(`API listening on :${port}`);
}

main().catch((err) => {
  // Pino will format this.
  console.error(err);
  process.exit(1);
});
