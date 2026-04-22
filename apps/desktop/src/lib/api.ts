import type {
  Project,
  ProjectSummary,
  UserSettings,
} from "@product/types";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

/**
 * If the API is unreachable (e.g. running the desktop app standalone),
 * every call falls back to a local in-memory / localStorage-backed
 * implementation so the UI continues to work end-to-end.
 *
 * This is what makes `npm run dev:desktop` usable with zero backend setup
 * while `npm run dev` brings the full stack to life.
 */

interface FetchOptions extends RequestInit {
  json?: unknown;
}

// Token provider wired up by AuthShell. Returns a Clerk JWT when available,
// or null when running in "skip for local development" mode.
let authTokenGetter: (() => Promise<string | null>) | null = null;
export function registerAuthTokenGetter(fn: () => Promise<string | null>) {
  authTokenGetter = fn;
}

async function buildHeaders(
  extra?: Record<string, string>,
): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    "content-type": "application/json",
    ...(extra ?? {}),
  };
  const clerkId = window.localStorage.getItem("product.clerk.userId");
  const clerkEmail = window.localStorage.getItem("product.clerk.email");
  headers["x-user-id"] = clerkId ?? "local-dev-user";
  if (clerkEmail) headers["x-user-email"] = clerkEmail;
  if (authTokenGetter) {
    try {
      const token = await authTokenGetter();
      if (token) headers["authorization"] = `Bearer ${token}`;
    } catch {
      /* fall back to x-user-id only */
    }
  }
  return headers;
}

async function call<T>(path: string, opts: FetchOptions = {}): Promise<T> {
  const { json, headers, ...rest } = opts;
  const res = await fetch(`${BASE}/v1${path}`, {
    ...rest,
    headers: await buildHeaders(headers as Record<string, string> | undefined),
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}

async function safeCall<T>(
  path: string,
  opts: FetchOptions,
  fallback: () => T | Promise<T>,
): Promise<T> {
  try {
    return await call<T>(path, opts);
  } catch (err) {
    console.warn("[api] falling back to local for", path, err);
    return await fallback();
  }
}

// ùùùùù Local fallback store ùùùùù
const LOCAL_KEY = "product.local.projects.v1";

function readLocal(): Record<string, Project> {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? (JSON.parse(raw) as Record<string, Project>) : {};
  } catch {
    return {};
  }
}

function writeLocal(projects: Record<string, Project>) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(projects));
}

function toSummary(p: Project): ProjectSummary {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    thumbnailUrl: p.thumbnailUrl ?? null,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    archivedAt: p.archivedAt,
    starred: p.starred,
    tags: p.tags,
  };
}

function newId() {
  return `local_${Math.random().toString(36).slice(2, 10)}`;
}

// ùùùùù Public API ùùùùù

export async function listProjects(): Promise<ProjectSummary[]> {
  return safeCall<{ projects: ProjectSummary[] }>(
    "/projects",
    { method: "GET" },
    () => ({
      projects: Object.values(readLocal())
        .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
        .map(toSummary),
    }),
  ).then((r) => r.projects);
}

export async function getProject(id: string): Promise<Project | null> {
  return safeCall<{ project: Project | null }>(
    `/projects/${id}`,
    { method: "GET" },
    () => ({ project: readLocal()[id] ?? null }),
  ).then((r) => r.project);
}

export async function createProject(args: {
  name: string;
  description?: string;
  initialPrompt?: string;
}): Promise<Project> {
  return safeCall<{ project: Project }>(
    "/projects",
    { method: "POST", json: args },
    () => {
      const id = newId();
      const now = new Date().toISOString();
      const project: Project = {
        id,
        userId: "local",
        name: args.name,
        description: args.description ?? "",
        thumbnailUrl: null,
        createdAt: now,
        updatedAt: now,
        archivedAt: null,
        starred: false,
        tags: [],
        conversation: args.initialPrompt
          ? [
              {
                id: newId(),
                role: "user",
                content: args.initialPrompt,
                timestamp: now,
              },
            ]
          : [],
        robotSpec: null,
        selectedComponentIds: [],
        simulationConfig: "",
        firmwareCode: "",
        environment: "empty",
        versions: [],
      };
      const all = readLocal();
      all[id] = project;
      writeLocal(all);
      return { project };
    },
  ).then((r) => r.project);
}

export async function updateProject(
  id: string,
  patch: Partial<Project> & { state?: unknown },
): Promise<Project | null> {
  return safeCall<{ project: Project | null }>(
    `/projects/${id}`,
    { method: "PATCH", json: patch },
    () => {
      const all = readLocal();
      const existing = all[id];
      if (!existing) return { project: null };
      const next: Project = {
        ...existing,
        ...patch,
        updatedAt: new Date().toISOString(),
      } as Project;
      all[id] = next;
      writeLocal(all);
      return { project: next };
    },
  ).then((r) => r.project);
}

export async function duplicateProject(id: string): Promise<Project | null> {
  return safeCall<{ project: Project | null }>(
    `/projects/${id}/duplicate`,
    { method: "POST" },
    () => {
      const all = readLocal();
      const src = all[id];
      if (!src) return { project: null };
      const nid = newId();
      const now = new Date().toISOString();
      const dup: Project = {
        ...src,
        id: nid,
        name: `${src.name} (copy)`,
        createdAt: now,
        updatedAt: now,
      };
      all[nid] = dup;
      writeLocal(all);
      return { project: dup };
    },
  ).then((r) => r.project);
}

export async function archiveProject(id: string): Promise<Project | null> {
  return safeCall<{ project: Project | null }>(
    `/projects/${id}/archive`,
    { method: "POST" },
    () => {
      const all = readLocal();
      const existing = all[id];
      if (!existing) return { project: null };
      all[id] = {
        ...existing,
        archivedAt: existing.archivedAt ? null : new Date().toISOString(),
      };
      writeLocal(all);
      return { project: all[id] ?? null };
    },
  ).then((r) => r.project);
}

export async function deleteProject(id: string): Promise<{ ok: true }> {
  return safeCall<{ ok: true }>(
    `/projects/${id}`,
    { method: "DELETE" },
    () => {
      const all = readLocal();
      delete all[id];
      writeLocal(all);
      return { ok: true };
    },
  );
}

export async function snapshotProject(
  id: string,
  label = "Manual snapshot",
): Promise<void> {
  await safeCall<{ version: unknown }>(
    `/projects/${id}/versions`,
    {
      method: "POST",
      json: { label, snapshotType: "manual" },
    },
    () => ({ version: null }),
  );
}

export async function getSettings(): Promise<Partial<UserSettings>> {
  return safeCall<{ settings: UserSettings | null }>(
    "/settings",
    { method: "GET" },
    () => ({ settings: null }),
  ).then((r) => r.settings ?? {});
}

export async function updateSettings(
  patch: Partial<UserSettings>,
): Promise<Partial<UserSettings>> {
  return safeCall<{ settings: UserSettings | null }>(
    "/settings",
    { method: "PATCH", json: patch },
    () => ({ settings: null }),
  ).then((r) => r.settings ?? {});
}

export interface ChatStreamHandlers {
  onEvent: (event: Record<string, unknown>) => void;
  onError?: (err: Error) => void;
  onDone?: () => void;
}

/**
 * Opens an SSE stream against POST /v1/chat. If the backend is unreachable,
 * runs a scripted client-side mock pipeline so the AI activity indicator
 * still shows a realistic flow.
 */
export async function streamChat(
  args: { projectId: string; content: string },
  handlers: ChatStreamHandlers,
): Promise<void> {
  try {
    const res = await fetch(`${BASE}/v1/chat`, {
      method: "POST",
      headers: await buildHeaders(),
      body: JSON.stringify(args),
    });
    if (!res.ok || !res.body) throw new Error(`stream ${res.status}`);

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split("\n\n");
      buffer = parts.pop() ?? "";
      for (const part of parts) {
        const data = part.replace(/^data:\s*/, "").trim();
        if (!data) continue;
        try {
          handlers.onEvent(JSON.parse(data));
        } catch {
          /* ignore bad frame */
        }
      }
    }
    handlers.onDone?.();
  } catch (err) {
    console.warn("[chat] streaming fallback", err);
    await runClientMockStream(args.content, handlers);
  }
}

async function runClientMockStream(
  prompt: string,
  handlers: ChatStreamHandlers,
) {
  const steps = [
    { phase: "thinking", label: "Thinking", delayMs: 400 },
    { phase: "designing", label: "Designing robot", delayMs: 700 },
    { phase: "components", label: "Selecting components", delayMs: 700 },
    { phase: "simulation", label: "Generating simulation", delayMs: 700 },
    { phase: "firmware", label: "Generating firmware", delayMs: 700 },
    { phase: "physics", label: "Running physics", delayMs: 400 },
  ];
  for (const s of steps) {
    handlers.onEvent({ type: "status", phase: s.phase, label: s.label });
    await new Promise((r) => setTimeout(r, s.delayMs));
    handlers.onEvent({ type: "step_complete", label: s.label });
  }
  const summary = `Drafted a build for: "${prompt}". (Client-side mock ù connect the API and set ANTHROPIC_API_KEY to run the full pipeline.)`;
  for (const chunk of summary.split(" ")) {
    handlers.onEvent({ type: "delta", text: chunk + " " });
    await new Promise((r) => setTimeout(r, 15));
  }
  handlers.onEvent({ type: "done" });
  handlers.onDone?.();
}

export interface ApiComponent {
  id: string;
  slug: string;
  name: string;
  manufacturer: string;
  category: string;
  subcategory: string | null;
  description: string;
  specs: Record<string, unknown>;
  suppliers: Array<{ name: string; priceUsd: number; purchaseUrl: string }>;
}

export async function listComponents(args?: {
  category?: string;
  search?: string;
}): Promise<ApiComponent[]> {
  const qs = new URLSearchParams();
  if (args?.category) qs.set("category", args.category);
  if (args?.search) qs.set("search", args.search);
  const path = qs.toString() ? `/components?${qs}` : "/components";
  return safeCall<{ components: ApiComponent[] }>(
    path,
    { method: "GET" },
    async () => {
      const { SEED_COMPONENTS } = await import("@product/components-db/seed");
      return {
        components: SEED_COMPONENTS.filter(
          (c) =>
            !args?.category ||
            c.category === args.category,
        )
          .filter((c) =>
            args?.search
              ? c.name.toLowerCase().includes(args.search.toLowerCase())
              : true,
          )
          .map(
            (c, i): ApiComponent => ({
              id: `seed_${i}`,
              slug: c.slug,
              name: c.name,
              manufacturer: c.manufacturer,
              category: c.category,
              subcategory: c.subcategory ?? null,
              description: c.description,
              specs: c.specs as Record<string, unknown>,
              suppliers: c.suppliers.map((s) => ({
                name: s.name,
                priceUsd: s.priceUsd,
                purchaseUrl: s.purchaseUrl,
              })),
            }),
          ),
      };
    },
  ).then((r) => r.components);
}
