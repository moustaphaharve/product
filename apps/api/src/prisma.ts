import { PrismaClient } from "@prisma/client";

/**
 * A single long-lived Prisma client. During local dev we reuse the client
 * across hot-reloads via a global var so we don't exhaust the database's
 * connection limit.
 */
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma =
  globalThis.__prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "production" ? ["error"] : ["warn", "error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}
