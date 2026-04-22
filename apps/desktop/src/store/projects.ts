import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Message, Project, ProjectSummary, RobotSpec } from "@product/types";

interface ProjectsState {
  summaries: ProjectSummary[];
  projects: Record<string, Project>;
  activeProjectId: string | null;
  saveState: "idle" | "saving" | "saved" | "error";
  lastSavedAt: string | null;

  setSummaries: (summaries: ProjectSummary[]) => void;
  upsertProject: (project: Project) => void;
  setActive: (id: string | null) => void;

  appendMessage: (projectId: string, message: Message) => void;
  updateLastAssistantMessage: (
    projectId: string,
    patch: Partial<Message>,
  ) => void;
  setRobotSpec: (projectId: string, spec: RobotSpec) => void;
  setFirmware: (projectId: string, firmware: string) => void;
  setSimulationConfig: (projectId: string, xml: string) => void;
  setEnvironment: (projectId: string, env: Project["environment"]) => void;
  setSelectedComponents: (projectId: string, ids: string[]) => void;

  markSaving: () => void;
  markSaved: () => void;
  markSaveError: () => void;
}

export const useProjectsStore = create<ProjectsState>()(
  persist(
    (set) => ({
      summaries: [],
      projects: {},
      activeProjectId: null,
      saveState: "idle",
      lastSavedAt: null,

      setSummaries: (summaries) => set({ summaries }),
      upsertProject: (project) =>
        set((s) => ({
          projects: { ...s.projects, [project.id]: project },
        })),
      setActive: (id) => set({ activeProjectId: id }),

      appendMessage: (projectId, message) =>
        set((s) => {
          const p = s.projects[projectId];
          if (!p) return s;
          return {
            projects: {
              ...s.projects,
              [projectId]: {
                ...p,
                conversation: [...p.conversation, message],
                updatedAt: new Date().toISOString(),
              },
            },
          };
        }),

      updateLastAssistantMessage: (projectId, patch) =>
        set((s) => {
          const p = s.projects[projectId];
          if (!p) return s;
          const conv = [...p.conversation];
          for (let i = conv.length - 1; i >= 0; i--) {
            const msg = conv[i];
            if (msg && msg.role === "assistant") {
              conv[i] = { ...msg, ...patch } as Message;
              break;
            }
          }
          return {
            projects: { ...s.projects, [projectId]: { ...p, conversation: conv } },
          };
        }),

      setRobotSpec: (projectId, spec) =>
        set((s) => {
          const p = s.projects[projectId];
          if (!p) return s;
          return {
            projects: {
              ...s.projects,
              [projectId]: { ...p, robotSpec: spec, environment: spec.environment },
            },
          };
        }),

      setFirmware: (projectId, firmware) =>
        set((s) => {
          const p = s.projects[projectId];
          if (!p) return s;
          return {
            projects: {
              ...s.projects,
              [projectId]: { ...p, firmwareCode: firmware },
            },
          };
        }),

      setSimulationConfig: (projectId, xml) =>
        set((s) => {
          const p = s.projects[projectId];
          if (!p) return s;
          return {
            projects: {
              ...s.projects,
              [projectId]: { ...p, simulationConfig: xml },
            },
          };
        }),

      setEnvironment: (projectId, env) =>
        set((s) => {
          const p = s.projects[projectId];
          if (!p) return s;
          return {
            projects: {
              ...s.projects,
              [projectId]: { ...p, environment: env },
            },
          };
        }),

      setSelectedComponents: (projectId, ids) =>
        set((s) => {
          const p = s.projects[projectId];
          if (!p) return s;
          return {
            projects: {
              ...s.projects,
              [projectId]: { ...p, selectedComponentIds: ids },
            },
          };
        }),

      markSaving: () => set({ saveState: "saving" }),
      markSaved: () =>
        set({ saveState: "saved", lastSavedAt: new Date().toISOString() }),
      markSaveError: () => set({ saveState: "error" }),
    }),
    { name: "product.projects" },
  ),
);
