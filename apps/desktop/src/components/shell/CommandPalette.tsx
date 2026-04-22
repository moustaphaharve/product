import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Command } from "cmdk";
import { useQuery } from "@tanstack/react-query";
import {
  Bot,
  FolderOpen,
  Plus,
  Settings,
  Sparkles,
  Cpu,
  Command as CommandIcon,
} from "lucide-react";
import { useAppStore } from "../../store/app";
import { listProjects, listComponents, createProject } from "../../lib/api";
import { TEMPLATES } from "../../data/templates";

export function CommandPalette() {
  const open = useAppStore((s) => s.commandPaletteOpen);
  const setOpen = useAppStore((s) => s.setCommandPaletteOpen);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: listProjects,
    enabled: open,
  });
  const componentsQuery = useQuery({
    queryKey: ["components-all"],
    queryFn: () => listComponents(),
    enabled: open,
  });

  useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  const close = () => setOpen(false);

  if (!open) return null;

  const run = (fn: () => void) => {
    fn();
    close();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[14vh] animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <button
        aria-label="Close"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={close}
      />
      <div className="relative w-[640px] max-w-[90vw] bg-bg-secondary border border-border-primary/60 rounded-xl shadow-2xl overflow-hidden animate-fadeInUp">
        <Command
          shouldFilter
          label="Command palette"
          className="flex flex-col"
        >
          <div className="flex items-center gap-2 px-4 h-12 border-b border-border-primary/50">
            <CommandIcon size={14} className="text-text-tertiary" />
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Search projects, components, settings…"
              className="flex-1 bg-transparent outline-none text-base text-text-primary placeholder:text-text-tertiary"
            />
            <kbd className="text-[10px] text-text-tertiary font-mono px-1.5 py-0.5 border border-border-primary/60 rounded">
              Esc
            </kbd>
          </div>

          <Command.List className="max-h-[480px] overflow-y-auto p-2">
            <Command.Empty className="px-3 py-8 text-center text-sm text-text-tertiary">
              No matches.
            </Command.Empty>

            <Command.Group
              heading="Actions"
              className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-text-tertiary"
            >
              <PaletteItem
                icon={<Plus size={14} />}
                label="New project"
                shortcut="?N"
                onSelect={() =>
                  run(async () => {
                    const p = await createProject({ name: "Untitled build" });
                    navigate(`/projects/${p.id}`);
                  })
                }
              />
              <PaletteItem
                icon={<Settings size={14} />}
                label="Open settings"
                shortcut="?,"
                onSelect={() => run(() => navigate("/settings"))}
              />
              <PaletteItem
                icon={<FolderOpen size={14} />}
                label="Go to Home"
                onSelect={() => run(() => navigate("/"))}
              />
            </Command.Group>

            {(projectsQuery.data ?? []).length > 0 && (
              <Command.Group
                heading="Projects"
                className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-text-tertiary"
              >
                {(projectsQuery.data ?? []).slice(0, 12).map((p) => (
                  <PaletteItem
                    key={p.id}
                    icon={<Bot size={14} />}
                    label={p.name}
                    hint={new Date(p.updatedAt).toLocaleString()}
                    onSelect={() => run(() => navigate(`/projects/${p.id}`))}
                  />
                ))}
              </Command.Group>
            )}

            <Command.Group
              heading="Templates"
              className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-text-tertiary"
            >
              {TEMPLATES.map((t) => (
                <PaletteItem
                  key={t.id}
                  icon={<Sparkles size={14} />}
                  label={t.name}
                  hint={t.oneLiner}
                  onSelect={() =>
                    run(async () => {
                      const p = await createProject({
                        name: t.name,
                        description: t.oneLiner,
                        initialPrompt: t.prompt,
                      });
                      navigate(`/projects/${p.id}`);
                    })
                  }
                />
              ))}
            </Command.Group>

            {(componentsQuery.data ?? []).length > 0 && (
              <Command.Group
                heading="Components"
                className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-text-tertiary"
              >
                {(componentsQuery.data ?? []).slice(0, 8).map((c) => (
                  <PaletteItem
                    key={c.id}
                    icon={<Cpu size={14} />}
                    label={c.name}
                    hint={c.manufacturer}
                    onSelect={() => run(close)}
                  />
                ))}
              </Command.Group>
            )}
          </Command.List>
        </Command>
      </div>
    </div>
  );
}

function PaletteItem({
  icon,
  label,
  hint,
  shortcut,
  onSelect,
}: {
  icon: React.ReactNode;
  label: string;
  hint?: string;
  shortcut?: string;
  onSelect: () => void;
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="group flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm text-text-secondary data-[selected='true']:bg-accent-strong data-[selected='true']:text-text-primary cursor-pointer"
    >
      <span className="text-text-tertiary group-data-[selected='true']:text-text-primary">
        {icon}
      </span>
      <span className="flex-1 truncate">{label}</span>
      {hint && (
        <span className="text-xs text-text-tertiary truncate max-w-[40%]">
          {hint}
        </span>
      )}
      {shortcut && (
        <kbd className="text-[10px] text-text-tertiary font-mono px-1.5 py-0.5 border border-border-primary/60 rounded">
          {shortcut}
        </kbd>
      )}
    </Command.Item>
  );
}
