import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRight, Bot, Clock, Plus, Sparkles } from "lucide-react";
import { Button } from "@product/ui";
import { createProject, listProjects } from "../lib/api";
import { TEMPLATES } from "../data/templates";

export function HomeView() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const qc = useQueryClient();

  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: listProjects,
  });

  const createMut = useMutation({
    mutationFn: createProject,
    onSuccess: (p) => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      navigate(`/projects/${p.id}`);
    },
  });

  const startFromPrompt = async () => {
    const trimmed = prompt.trim();
    if (!trimmed) return;
    const name = trimmed.slice(0, 48);
    await createMut.mutateAsync({
      name: name.length === 48 ? name + "ù" : name,
      initialPrompt: trimmed,
    });
  };

  const startFromTemplate = async (t: (typeof TEMPLATES)[number]) => {
    await createMut.mutateAsync({
      name: t.name,
      description: t.oneLiner,
      initialPrompt: t.prompt,
    });
  };

  const recent = (projectsQuery.data ?? [])
    .filter((p) => !p.archivedAt)
    .slice(0, 6);

  return (
    <div className="h-full w-full overflow-y-auto">
      <div className="max-w-[980px] mx-auto px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10"
        >
          <h1 className="text-[32px] leading-[1.15] tracking-[-0.02em] font-normal text-text-primary">
            What do you want to build today?
          </h1>
          <p className="mt-2 text-md text-text-secondary">
            Describe a robot in plain English. We'll design, simulate, source
            parts, and generate firmware.
          </p>
        </motion.div>

        {/* Start-from-scratch card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-xl border border-border-primary/60 bg-bg-secondary overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-transparent pointer-events-none" />
          <div className="relative p-5">
            <div className="flex items-center gap-2 mb-3 text-sm text-text-tertiary">
              <Sparkles size={13} />
              Start from scratch
            </div>
            <textarea
              ref={inputRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                  e.preventDefault();
                  void startFromPrompt();
                }
              }}
              rows={3}
              placeholder="Build me a rover that can explore off-road terrainù"
              className="w-full resize-none bg-transparent text-lg text-text-primary placeholder:text-text-tertiary outline-none"
              autoFocus
            />
            <div className="mt-3 flex items-center justify-between">
              <div className="text-xs text-text-tertiary">
                <kbd className="font-mono">??</kbd> to create
              </div>
              <Button
                variant="primary"
                onClick={startFromPrompt}
                disabled={!prompt.trim() || createMut.isPending}
              >
                {createMut.isPending ? "Creatingù" : "Create project"}
                <ArrowRight size={14} />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Recent projects */}
        {recent.length > 0 && (
          <section className="mt-12">
            <SectionHeader icon={<Clock size={13} />} label="Recent projects" />
            <div className="grid grid-cols-3 gap-3 mt-3">
              {recent.map((p) => (
                <button
                  key={p.id}
                  onClick={() => navigate(`/projects/${p.id}`)}
                  className="group text-left rounded-lg border border-border-primary/50 bg-bg-secondary overflow-hidden hover:border-border-secondary/80 transition-colors duration-micro"
                >
                  <div className="h-28 bg-gradient-to-br from-bg-tertiary via-bg-secondary to-bg-primary relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center opacity-50 group-hover:opacity-80 transition-opacity duration-micro">
                      <Bot size={26} className="text-text-tertiary" />
                    </div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.06),transparent_60%)]" />
                  </div>
                  <div className="p-3">
                    <div className="text-sm text-text-primary truncate">
                      {p.name}
                    </div>
                    <div className="text-[11px] text-text-tertiary mt-0.5">
                      {new Date(p.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </button>
              ))}
              {recent.length < 6 && (
                <button
                  onClick={() => inputRef.current?.focus()}
                  className="rounded-lg border border-dashed border-border-primary/60 bg-transparent hover:bg-accent-subtle flex flex-col items-center justify-center gap-1.5 text-text-tertiary hover:text-text-secondary transition-colors duration-micro min-h-[156px]"
                >
                  <Plus size={16} />
                  <span className="text-xs">New from prompt</span>
                </button>
              )}
            </div>
          </section>
        )}

        {/* Templates */}
        <section className="mt-12 mb-8">
          <SectionHeader icon={<Sparkles size={13} />} label="Templates to try" />
          <div className="grid grid-cols-3 gap-3 mt-3">
            {TEMPLATES.slice(0, 6).map((t) => (
              <TemplateCard
                key={t.id}
                template={t}
                onStart={() => startFromTemplate(t)}
                disabled={createMut.isPending}
              />
            ))}
          </div>
        </section>

        <div className="text-[11px] text-text-tertiary text-center pb-8">
          Community templates coming soon.
        </div>
      </div>
    </div>
  );
}

function SectionHeader({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-text-tertiary font-medium">
      {icon}
      <span>{label}</span>
    </div>
  );
}

function TemplateCard({
  template,
  onStart,
  disabled,
}: {
  template: (typeof TEMPLATES)[number];
  onStart: () => void;
  disabled: boolean;
}) {
  return (
    <div className="rounded-lg border border-border-primary/50 bg-bg-secondary overflow-hidden flex flex-col">
      <div
        className={`h-24 relative overflow-hidden bg-gradient-to-br ${template.accent}`}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <Bot size={22} className="text-text-secondary" />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.08),transparent_60%)]" />
      </div>
      <div className="p-3 flex-1 flex flex-col">
        <div className="text-sm text-text-primary font-medium">{template.name}</div>
        <div className="text-[11px] text-text-tertiary mt-0.5 flex-1">
          {template.oneLiner}
        </div>
        <button
          onClick={onStart}
          disabled={disabled}
          className="mt-2.5 text-left text-xs text-text-secondary hover:text-text-primary inline-flex items-center gap-1 transition-colors duration-micro disabled:opacity-50"
        >
          Start with this
          <ArrowRight size={11} />
        </button>
      </div>
    </div>
  );
}
