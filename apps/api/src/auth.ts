import type { FastifyRequest } from "fastify";
import { createClerkClient, verifyToken } from "@clerk/backend";

/**
 * Hybrid auth for the API.
 *
 * 1. If `CLERK_SECRET_KEY` + a `Bearer <JWT>` are present, we verify the
 *    Clerk session and upsert the matching `User` row.
 * 2. Otherwise we fall back to the `x-user-id` header (+ optional
 *    `x-user-email`) the desktop client sends in "Skip for local dev" mode.
 *    This keeps the app usable with no secrets configured.
 *
 * Either way, the returned `AuthedUser` has the shape the routes use, so
 * swapping Clerk on/off is transparent to the rest of the codebase.
 */

export interface AuthedUser {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
}

const clerk = process.env.CLERK_SECRET_KEY
  ? createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })
  : null;

export async function resolveUser(
  req: FastifyRequest,
): Promise<AuthedUser> {
  const { prisma } = await import("./prisma");

  // Path 1: verified Clerk session.
  if (clerk) {
    const auth = req.headers["authorization"];
    const token =
      typeof auth === "string" && auth.startsWith("Bearer ")
        ? auth.slice(7)
        : null;
    if (token) {
      try {
        const verified = await verifyToken(token, {
          secretKey: process.env.CLERK_SECRET_KEY!,
        });
        const clerkId = verified.sub;
        // Fetch canonical profile so email / name are always current.
        const profile = await clerk.users.getUser(clerkId).catch(() => null);
        const email =
          profile?.emailAddresses[0]?.emailAddress ??
          (req.headers["x-user-email"] as string | undefined) ??
          `${clerkId}@users.clerk`;
        const name =
          profile?.firstName || profile?.lastName
            ? [profile?.firstName, profile?.lastName]
                .filter(Boolean)
                .join(" ")
            : null;

        const user = await prisma.user.upsert({
          where: { clerkId },
          create: {
            clerkId,
            email,
            name,
            avatarUrl: profile?.imageUrl ?? null,
            settings: { create: {} },
            credits: {
              create: {
                periodEnd: new Date(Date.now() + 30 * 24 * 3600 * 1000),
              },
            },
          },
          update: { email, name, avatarUrl: profile?.imageUrl ?? undefined },
        });

        return {
          id: user.id,
          clerkId: user.clerkId,
          email: user.email,
          name: user.name,
        };
      } catch (err) {
        req.log.warn({ err }, "Clerk token verification failed; falling back");
      }
    }
  }

  // Path 2: header-based local-dev shim.
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
      settings: { create: {} },
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
