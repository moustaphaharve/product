import type { FastifyRequest } from "fastify";

/**
 * Lightweight auth shim.
 *
 * In production this would verify a Clerk JWT from the Authorization header
 * and resolve the user. For alpha we accept `x-user-id` from the desktop
 * client and fall back to a single local-dev user.
 *
 * The shape is compatible with how a real Clerk-backed middleware would
 * populate `request.user`, so swapping it in later is mechanical.
 */
export interface AuthedUser {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
}

export async function resolveUser(
  req: FastifyRequest,
): Promise<AuthedUser> {
  const { prisma } = await import("./prisma");
  const clerkId =
    (req.headers["x-user-id"] as string | undefined) ?? "local-dev-user";
  const email =
    (req.headers["x-user-email"] as string | undefined) ??
    "you@example.com";

  const user = await prisma.user.upsert({
    where: { clerkId },
    create: {
      clerkId,
      email,
      name: "Local Dev",
      settings: {
        create: {},
      },
      credits: {
        create: {
          periodEnd: new Date(Date.now() + 30 * 24 * 3600 * 1000),
        },
      },
    },
    update: {},
  });

  return {
    id: user.id,
    clerkId: user.clerkId,
    email: user.email,
    name: user.name,
  };
}
