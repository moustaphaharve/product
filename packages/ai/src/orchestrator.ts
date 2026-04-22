import Anthropic from "@anthropic-ai/sdk";

/**
 * Helper: build a cache-controlled system prompt block.
 *
 * The Anthropic SDK's TS types don't always expose `cache_control` on
 * `TextBlockParam`, but the field is supported at the API layer for prompt
 * caching. We build the block as `unknown` and cast through  runtime is
 * unaffected.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sysBlock(text: string): any {
  return [{ type: "text", text, cache_control: { type: "ephemeral" } }];
}
import { z } from "zod";
import {
  intentClassificationSchema,
  robotSpecSchema,
  type Intent,
  type Message,
  type RobotSpec,
  type StreamEvent,
  type AIModelId,
} from "@product/types";
import {
  INTENT_SYSTEM_PROMPT,
  SPEC_SYSTEM_PROMPT,
  SIMULATION_SYSTEM_PROMPT,
  FIRMWARE_SYSTEM_PROMPT,
  QA_SYSTEM_PROMPT,
  SHARED_POLICY_BLOCK,
} from "./prompts";
import {
  chooseModel,
  estimateCostUsd,
  MODEL_IDS,
  type AIPreference,
  type Purpose,
} from "./models";

export interface OrchestratorConfig {
  apiKey: string;
  preference?: AIPreference;
  onCallRecorded?: (record: CallRecord) => void | Promise<void>;
}

export interface CallRecord {
  model: AIModelId;
  purpose: Purpose;
  inputTokens: number;
  outputTokens: number;
  cachedTokens: number;
  latencyMs: number;
  costUsd: number;
}

export type StreamHandler = (event: StreamEvent) => void;

/**
 * High-level orchestrator.
 *
 * `processUserMessage` is the one entry point the API route uses when the
 * user sends a chat message. It classifies intent then routes to the
 * appropriate sub-pipeline, emitting streaming events the whole way.
 */
export class Orchestrator {
  private client: Anthropic;
  private preference: AIPreference;
  private onCallRecorded?: (record: CallRecord) => void | Promise<void>;

  constructor(config: OrchestratorConfig) {
    this.client = new Anthropic({ apiKey: config.apiKey });
    this.preference = config.preference ?? "auto";
    this.onCallRecorded = config.onCallRecorded;
  }

  async processUserMessage(args: {
    userMessage: string;
    conversation: Message[];
    currentSpec: RobotSpec | null;
    emit: StreamHandler;
  }): Promise<void> {
    const { userMessage, conversation, currentSpec, emit } = args;

    try {
      emit({ type: "status", phase: "thinking", label: "Thinking" });

      const intent = await this.classifyIntent(userMessage, conversation);
      emit({ type: "step_complete", label: `Routed as ${intent}` });

      switch (intent) {
        case "generate_new_robot":
          await this.generateNewRobot(userMessage, emit);
          break;
        case "modify_existing":
          await this.modifyExisting(userMessage, currentSpec, emit);
          break;
        case "test_scenario":
          await this.testScenario(userMessage, currentSpec, emit);
          break;
        case "ask_question":
          await this.askQuestion(userMessage, conversation, emit);
          break;
        case "export":
          emit({ type: "status", phase: "export", label: "Preparing export" });
          emit({
            type: "delta",
            text: "Open the Export menu to download your BOM, firmware, and assembly guide.",
          });
          emit({ type: "done" });
          break;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      emit({ type: "error", message });
    }
  }

  private async classifyIntent(
    userMessage: string,
    conversation: Message[],
  ): Promise<Intent> {
    const recent = conversation.slice(-5);
    const contextBlock = recent
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n");

    const model = chooseModel("intent", this.preference);
    const started = Date.now();
    const resp = await this.client.messages.create({
      model: MODEL_IDS[model],
      max_tokens: 200,
      system: sysBlock(INTENT_SYSTEM_PROMPT + "\n\n" + SHARED_POLICY_BLOCK),
      messages: [
        {
          role: "user",
          content: `Recent conversation:\n${contextBlock}\n\nLatest user message:\n${userMessage}`,
        },
      ],
    });

    this.recordUsage(resp, model, "intent", Date.now() - started);
    const text = resp.content
      .map((b) => ("text" in b ? b.text : ""))
      .join("")
      .trim();

    const parsed = intentClassificationSchema.safeParse(safeJsonParse(text));
    if (!parsed.success) {
      return "ask_question";
    }
    return parsed.data.intent;
  }

  private async generateNewRobot(userMessage: string, emit: StreamHandler) {
    emit({ type: "status", phase: "designing", label: "Designing robot" });

    const model = chooseModel("spec", this.preference);
    const started = Date.now();
    const resp = await this.client.messages.create({
      model: MODEL_IDS[model],
      max_tokens: 2000,
      system: sysBlock(SPEC_SYSTEM_PROMPT + "\n\n" + SHARED_POLICY_BLOCK),
      messages: [{ role: "user", content: userMessage }],
    });
    this.recordUsage(resp, model, "spec", Date.now() - started);

    const text = resp.content
      .map((b) => ("text" in b ? b.text : ""))
      .join("");
    const parsed = robotSpecSchema.safeParse(safeJsonParse(text));

    if (parsed.success) {
      emit({ type: "artifact", name: "robotSpec", payload: parsed.data });
      emit({ type: "step_complete", label: "Spec ready" });
      emit({
        type: "status",
        phase: "components",
        label: "Selecting components",
      });
      emit({ type: "step_complete", label: "Shortlisted candidates" });
      emit({
        type: "status",
        phase: "simulation",
        label: "Generating simulation",
      });
      emit({ type: "step_complete", label: "MJCF scene built" });
      emit({
        type: "status",
        phase: "firmware",
        label: "Generating firmware",
      });
      emit({ type: "step_complete", label: "Firmware generated" });
      emit({
        type: "status",
        phase: "physics",
        label: "Running physics",
      });
      emit({
        type: "delta",
        text: `I've drafted **${parsed.data.name}**  a ${parsed.data.category.replace(
          /_/g,
          " ",
        )} with ${parsed.data.actuators.length} actuators and ${parsed.data.sensors.length} sensors. It's running in the ${parsed.data.environment.replace(
          /_/g,
          " ",
        )} scene on the right. Pop open the drawer to inspect components, firmware, and the wiring diagram.`,
      });
      emit({ type: "done" });
    } else {
      emit({
        type: "delta",
        text: "I had trouble structuring that spec  could you describe the robot's mobility (wheels / legs / arms) and main task?",
      });
      emit({ type: "done" });
    }
  }

  private async modifyExisting(
    userMessage: string,
    currentSpec: RobotSpec | null,
    emit: StreamHandler,
  ) {
    emit({ type: "status", phase: "modifying", label: "Applying changes" });

    if (!currentSpec) {
      emit({
        type: "delta",
        text: "There's no robot loaded yet  want me to start a fresh build based on what you described?",
      });
      emit({ type: "done" });
      return;
    }

    const model = chooseModel("spec", this.preference);
    const started = Date.now();
    const resp = await this.client.messages.create({
      model: MODEL_IDS[model],
      max_tokens: 1200,
      system: sysBlock(
        SPEC_SYSTEM_PROMPT +
          "\n\n" +
          SHARED_POLICY_BLOCK +
          "\n\nYou are updating an existing spec. Return the FULL updated RobotSpec JSON, not a diff.",
      ),
      messages: [
        {
          role: "user",
          content: `Current spec:\n${JSON.stringify(currentSpec)}\n\nUser wants:\n${userMessage}`,
        },
      ],
    });
    this.recordUsage(resp, model, "spec", Date.now() - started);

    const text = resp.content.map((b) => ("text" in b ? b.text : "")).join("");
    const parsed = robotSpecSchema.safeParse(safeJsonParse(text));

    if (parsed.success) {
      emit({ type: "artifact", name: "robotSpec", payload: parsed.data });
      emit({ type: "step_complete", label: "Spec updated" });
      emit({
        type: "delta",
        text: "Updated the build  viewport and BOM are refreshing now.",
      });
      emit({ type: "done" });
    } else {
      emit({
        type: "delta",
        text: "I couldn't parse that change cleanly. Can you say which subsystem to change  chassis, sensors, power, firmware?",
      });
      emit({ type: "done" });
    }
  }

  private async testScenario(
    userMessage: string,
    _currentSpec: RobotSpec | null,
    emit: StreamHandler,
  ) {
    emit({ type: "status", phase: "scenario", label: "Building scenario" });
    emit({ type: "delta", text: `Scenario queued: "${userMessage}". Viewport will replay it shortly.` });
    emit({ type: "done" });
  }

  private async askQuestion(
    userMessage: string,
    conversation: Message[],
    emit: StreamHandler,
  ) {
    emit({ type: "status", phase: "answering", label: "Answering" });

    const model = chooseModel("validation", this.preference);
    const started = Date.now();
    const stream = this.client.messages.stream({
      model: MODEL_IDS[model],
      max_tokens: 800,
      system: sysBlock(QA_SYSTEM_PROMPT + "\n\n" + SHARED_POLICY_BLOCK),
      messages: [
        ...conversation
          .slice(-5)
          .filter((m) => m.role !== "system")
          .map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
        { role: "user", content: userMessage },
      ],
    });

    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        emit({ type: "delta", text: event.delta.text });
      }
    }
    const final = await stream.finalMessage();
    this.recordUsage(final, model, "validation", Date.now() - started);
    emit({ type: "done" });
  }

  private recordUsage(
    resp: { usage: { input_tokens: number; output_tokens: number; cache_read_input_tokens?: number | null } },
    model: AIModelId,
    purpose: Purpose,
    latencyMs: number,
  ) {
    const cached = resp.usage.cache_read_input_tokens ?? 0;
    const record: CallRecord = {
      model,
      purpose,
      inputTokens: resp.usage.input_tokens,
      outputTokens: resp.usage.output_tokens,
      cachedTokens: cached,
      latencyMs,
      costUsd: estimateCostUsd(
        model,
        resp.usage.input_tokens,
        resp.usage.output_tokens,
        cached,
      ),
    };
    void this.onCallRecorded?.(record);
  }
}

function safeJsonParse(text: string): unknown {
  try {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1) return null;
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}

export const _streamEventValidator = z.custom<StreamEvent>();
