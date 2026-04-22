import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Share2,
  Download,
  History,
  Check,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Button, cn } from "@product/ui";
import { getProject, snapshotProject, updateProject } from "../lib/api";
import { useProjectsStore } from "../store/projects";
import { Conversation } from "../components/workspace/Conversation";
import { Viewport } from "../components/workspace/Viewport";
import { Drawer } from "../components/workspace/Drawer";
import { useAutosave } from "../hooks/useAutosave";
import { useAppStore } from "../store/app";

export function WorkspaceView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [renaming, setRenaming] = useState(false);
  const [draftName, setDraftName] = useState("");

  const upsert = useProjectsStore((s) => s.upsertProject);
  const setActive = useProjectsStore((s) => s.setActive);
  const project = useProjectsStore((s) =>
    id ? s.projects[id] : undefined,
  );
  const saveState = useProjectsStore((s) => s.saveState);

  const query = useQuery({
    queryKey: ["project", id],
    queryFn: () => (id ? getProject(id) : Promise.resolve(null)),
    enabled: !!id,
  });

  useEffect(() => {
    if (query.data) {
      upsert(query.data);
      setActive(query.data.id);
    }
    return () => setActive(null);
  }, [query.data, upsert, setActive]);

  useAutosave(id);

  if (!id) return null;

  if (query.isLoading && !project) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Loader2 size={18} className="animate-spin text-text-tertiary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="h-full w-full flex items-center justify-center flex-col gap-3 text-text-secondary">
        <AlertTriangle size={20} className="text-semantic-warning" />
        <div>Project not found.</div>
        <Button onClick={() => navigate("/")}>Back to home</Button>
      </div>
    );
  }

  const commitName = async (value: string) => {
    if (value && value !== project.name) {
      await updateProject(project.id, { name: value });
      qc.invalidateQueries({ queryKey: ["projects"] });
      upsert({ ...project, name: value });
    }
    setRenaming(false);
  };

  return (
    <div className="h-full w-full flex flex-col">
      <TopBar
        name={project.name}
        saveState={saveState}
        onBack={() => navigate("/")}
        renaming={renaming}
        setRenaming={setRenaming}
        draftName={draftName}
        setDraftName={setDraftName}
        commitName={commitName}
        projectId={project.id}
      />

      <div className="flex-1 flex min-h-0">
        <div className="w-[420px] border-r border-border-primary/50 min-w-0">
          <Conversation projectId={project.id} />
        </div>
        <div className="flex-1 min-w-0 relative">
          <Viewport projectId={project.id} />
          <Drawer projectId={project.id} />
        </div>
      </div>
    </div>
  );
}

function TopBar({
  name,
  saveState,
  onBack,
  renaming,
  setRenaming,
  draftName,
  setDraftName,
  commitName,
  projectId,
}: {
  name: string;
  saveState: "idle" | "saving" | "saved" | "error";
  onBack: () => void;
  renaming: boolean;
  setRenaming: (v: boolean) => void;
  draftName: string;
  setDraftName: (s: string) => void;
  commitName: (s: string) => Promise<void>;
  projectId: string;
}) {
  return (
    <div className="h-11 shrink-0 border-b border-border-primary/50 flex items-center justify-between px-3 bg-bg-secondary/60 backdrop-blur">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <button
          onClick={onBack}
          className="h-7 w-7 rounded-md inline-flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-accent-subtle transition-colors duration-micro"
          aria-label="Back to home"
        >
          <ArrowLeft size={14} />
        </button>
        <div className="text-text-tertiary text-sm">Home / </div>
        {renaming ? (
          <input
            autoFocus
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            onBlur={() => commitName(draftName)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitName(draftName);
              if (e.key === "Escape") setRenaming(false);
            }}
            className="bg-transparent border-b border-border-secondary/60 text-sm text-text-primary outline-none px-1 py-0.5 max-w-[240px]"
          />
        ) : (
          <button
            onClick={() => {
              setDraftName(name);
              setRenaming(true);
            }}
            className="text-sm text-text-primary truncate hover:text-text-primary/80 transition-colors duration-micro max-w-[320px]"
          >
            {name}
          </button>
        )}
        <SaveIndicator state={saveState} />
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => snapshotProject(projectId, "Manual snapshot")}
          className="gap-1.5"
        >
          <History size={13} />
          History
        </Button>
        <Button variant="ghost" size="sm" className="gap-1.5">
          <Share2 size={13} />
          Share
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="gap-1.5"
          onClick={() =>
            window.open(
              `${import.meta.env.VITE_API_URL ?? "http://localhost:4000"}/v1/projects/${projectId}/export`,
              "_blank",
            )
          }
        >
          <Download size={13} />
          Export
        </Button>
      </div>
    </div>
  );
}

function SaveIndicator({
  state,
}: {
  state: "idle" | "saving" | "saved" | "error";
}) {
  const content = {
    idle: { icon: null, text: "" },
    saving: {
      icon: <Loader2 size={11} className="animate-spin" />,
      text: "Saving…",
    },
    saved: { icon: <Check size={11} />, text: "All changes saved" },
    error: {
      icon: <AlertTriangle size={11} className="text-semantic-warning" />,
      text: "Unsaved changes",
    },
  }[state];
  if (!content.text) return null;
  return (
    <AnimatePresence>
      <motion.div
        key={state}
        initial={{ opacity: 0, x: -2 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 2 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "ml-2 flex items-center gap-1.5 text-[11px]",
          state === "error" ? "text-semantic-warning" : "text-text-tertiary",
        )}
      >
        {content.icon}
        <span>{content.text}</span>
      </motion.div>
    </AnimatePresence>
  );
}
