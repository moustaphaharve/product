import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, Bot, User } from "lucide-react";
import { useProjectsStore } from "../../store/projects";
import { streamChat } from "../../lib/api";
import { ActivityIndicator } from "./ActivityIndicator";
import type { Message, MessageActivity, RobotSpec } from "@product/types";

export function Conversation({ projectId }: { projectId: string }) {
  const project = useProjectsStore((s) => s.projects[projectId]);
  const appendMessage = useProjectsStore((s) => s.appendMessage);
  const updateLastAssistant = useProjectsStore(
    (s) => s.updateLastAssistantMessage,
  );
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const messages = project?.conversation ?? [];

  useEffect(() => {
    scrollerRef.current?.scrollTo({
      top: scrollerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length, streaming]);

  // If the project opened with a user-only initial prompt, auto-kick a response.
  const triggered = useRef(false);
  useEffect(() => {
    if (triggered.current) return;
    if (!project) return;
    const conv = project.conversation;
    if (conv.length === 1 && conv[0]?.role === "user" && !streaming) {
      triggered.current = true;
      const message = conv[0];
      void runStream(message.content);
    }
  }, [project]);

  const runStream = async (content: string) => {
    setStreaming(true);

    const activity: MessageActivity = {
      status: "thinking",
      label: "Thinking",
      steps: [],
    };
    const assistantId = cryptoRandom();
    const assistantMsg: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
      timestamp: new Date().toISOString(),
      activity,
    };
    appendMessage(projectId, assistantMsg);

    let text = "";
    const stepsAcc: MessageActivity["steps"] = [];

    await streamChat(
      { projectId, content },
      {
        onEvent: (event) => {
          if (event.type === "status") {
            updateLastAssistant(projectId, {
              activity: {
                status: "generating",
                label: String(event.label ?? "Working"),
                steps: stepsAcc.slice(),
              },
            });
          } else if (event.type === "step_complete") {
            stepsAcc.push({
              label: String(event.label ?? "Step"),
              completedAt: new Date().toISOString(),
            });
            updateLastAssistant(projectId, {
              activity: {
                status: "generating",
                label: String(event.label ?? "Working"),
                steps: stepsAcc.slice(),
              },
            });
          } else if (event.type === "delta") {
            text += String(event.text ?? "");
            updateLastAssistant(projectId, { content: text });
          } else if (event.type === "artifact") {
            if (event.name === "robotSpec" && event.payload) {
              useProjectsStore
                .getState()
                .setRobotSpec(projectId, event.payload as RobotSpec);
            }
          } else if (event.type === "done") {
            updateLastAssistant(projectId, {
              activity: {
                status: "complete",
                label: "Ready",
                steps: stepsAcc.slice(),
              },
            });
          } else if (event.type === "error") {
            updateLastAssistant(projectId, {
              activity: {
                status: "error",
                label: "Error",
                steps: stepsAcc.slice(),
                errorMessage: String(event.message ?? "Unknown error"),
              },
            });
          }
        },
        onDone: () => setStreaming(false),
      },
    );
    setStreaming(false);
  };

  const submit = async () => {
    const trimmed = input.trim();
    if (!trimmed || streaming) return;
    const userMsg: Message = {
      id: cryptoRandom(),
      role: "user",
      content: trimmed,
      timestamp: new Date().toISOString(),
    };
    appendMessage(projectId, userMsg);
    setInput("");
    await runStream(trimmed);
  };

  return (
    <div className="h-full flex flex-col bg-bg-secondary">
      <div
        ref={scrollerRef}
        className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4"
      >
        {messages.length === 0 && (
          <div className="text-sm text-text-tertiary italic">
            Type a prompt below to start building.
          </div>
        )}
        {messages.map((m) => (
          <MessageView key={m.id} message={m} />
        ))}
      </div>
      <div className="border-t border-border-primary/50 p-3">
        <div className="rounded-lg border border-border-primary/60 bg-bg-input focus-within:border-border-focus transition-colors duration-micro">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                e.preventDefault();
                void submit();
              }
            }}
            rows={2}
            placeholder="Ask to change something, or test a scenario"
            className="w-full resize-none bg-transparent text-sm outline-none p-2.5"
          />
          <div className="flex items-center justify-between px-2.5 pb-2">
            <div className="text-[11px] text-text-tertiary">
              <kbd className="font-mono">??</kbd> to send
            </div>
            <button
              disabled={!input.trim() || streaming}
              onClick={submit}
              className="h-7 w-7 rounded-md bg-text-primary text-bg-primary inline-flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-text-primary/90 transition-colors duration-micro"
              aria-label="Send"
            >
              <ArrowUp size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageView({ message }: { message: Message }) {
  if (message.role === "user") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex gap-3"
      >
        <div className="h-6 w-6 rounded-full bg-gradient-to-br from-neutral-300 to-neutral-500 flex items-center justify-center shrink-0 text-[10px] text-black">
          <User size={11} />
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          <div className="text-[11px] text-text-tertiary mb-1">You</div>
          <div className="text-sm text-text-primary whitespace-pre-wrap">
            {message.content}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex gap-3"
    >
      <div className="h-6 w-6 rounded-full bg-bg-tertiary border border-border-primary/60 flex items-center justify-center shrink-0">
        <Bot size={11} className="text-text-secondary" />
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="text-[11px] text-text-tertiary mb-1">Product</div>
        {message.activity && <ActivityIndicator activity={message.activity} />}
        {message.content && (
          <div className="text-sm text-text-primary whitespace-pre-wrap mt-1">
            {message.content}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function cryptoRandom() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}
