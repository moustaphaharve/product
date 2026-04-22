import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../prisma";
import { resolveUser } from "../auth";
import { Orchestrator, type CallRecord } from "@product/ai";

const body = z.object({
  projectId: z.string(),
  content: z.string().min(1),
});

/**
 * Streams AI orchestration events to the client via Server-Sent Events.
 * If ANTHROPIC_API_KEY is unset we fall through to a scripted mock pipeline
 * that still emits the same StreamEvent shape so the UI is fully testable
 * without API credentials.
 */
export async function chatRoutes(app: FastifyInstance) {
  app.post("/chat", async (req, reply) => {
    const user = await resolveUser(req);
    const parsed = body.parse(req.body);
    const project = await prisma.project.findFirst({
      where: { id: parsed.projectId, userId: user.id },
    });
    if (!project) return reply.notFound();

    reply.raw.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    });

    const emit = (event: unknown) => {
      reply.raw.write(`data: ${JSON.stringify(event)}\n\n`);
    };

    const userMessage = await prisma.message.create({
      data: {
        projectId: project.id,
        role: "user",
        content: parsed.content,
      },
    });
    emit({ type: "user_message_saved", id: userMessage.id });

    const state = project.state as Record<string, unknown>;
    const conversation =
      (state?.conversation as Parameters<
        Orchestrator["processUserMessage"]
      >[0]["conversation"]) ?? [];
    const currentSpec =
      (state?.robotSpec as Parameters<
        Orchestrator["processUserMessage"]
      >[0]["currentSpec"]) ?? null;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    let assistantText = "";

    const recordCall = async (call: CallRecord) => {
      await prisma.aICall.create({
        data: {
          projectId: project.id,
          userId: user.id,
          model: call.model,
          inputTokens: call.inputTokens,
          outputTokens: call.outputTokens,
          cachedTokens: call.cachedTokens,
          latencyMs: call.latencyMs,
          costUsd: call.costUsd,
          purpose: call.purpose,
        },
      });
      const creditsConsumed = Math.max(
        Math.round(call.costUsd * 100),
        1,
      );
      await prisma.userCredits
        .update({
          where: { userId: user.id },
          data: { creditsUsedThisPeriod: { increment: creditsConsumed } },
        })
        .catch(() => undefined);
    };

    try {
      if (apiKey) {
        const orch = new Orchestrator({
          apiKey,
          onCallRecorded: recordCall,
        });
        await orch.processUserMessage({
          userMessage: parsed.content,
          conversation: conversation,
          currentSpec: currentSpec,
          emit: (event) => {
            if (event.type === "delta") assistantText += event.text;
            emit(event);
          },
        });
      } else {
        await runMockPipeline(parsed.content, (event) => {
          if (event.type === "delta") assistantText += event.text;
          emit(event);
        });
      }

      await prisma.message.create({
        data: {
          projectId: project.id,
          role: "assistant",
          content: assistantText || "(response recorded)",
        },
      });
    } catch (err) {
      app.log.error({ err }, "chat pipeline failed");
      emit({ type: "error", message: (err as Error).message });
    } finally {
      reply.raw.end();
    }
  });
}

async function runMockPipeline(
  prompt: string,
  emit: (event: Record<string, unknown>) => void,
) {
  const steps: Array<{ phase: string; label: string; delayMs: number }> = [
    { phase: "thinking", label: "Thinking", delayMs: 500 },
    { phase: "designing", label: "Designing robot", delayMs: 900 },
    { phase: "components", label: "Selecting components", delayMs: 900 },
    { phase: "simulation", label: "Generating simulation", delayMs: 900 },
    { phase: "firmware", label: "Generating firmware", delayMs: 900 },
    { phase: "physics", label: "Running physics", delayMs: 600 },
  ];
  for (const s of steps) {
    emit({ type: "status", phase: s.phase, label: s.label });
    await new Promise((r) => setTimeout(r, s.delayMs));
    emit({ type: "step_complete", label: s.label });
  }
  const summary = `Drafted a build for: "${prompt}". This is a mock response — set ANTHROPIC_API_KEY to run the full pipeline.`;
  for (const chunk of summary.split(" ")) {
    emit({ type: "delta", text: chunk + " " });
    await new Promise((r) => setTimeout(r, 20));
  }
  emit({ type: "done" });
}
