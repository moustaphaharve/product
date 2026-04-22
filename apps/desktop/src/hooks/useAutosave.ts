import { useEffect, useRef } from "react";
import { useProjectsStore } from "../store/projects";
import { updateProject } from "../lib/api";

/**
 * Debounced auto-save of the full project state to the API.
 *
 * Fires whenever the persisted project shape changes. We persist the
 * workspace state shape the backend expects (conversation, robotSpec,
 * selectedComponentIds, simulationConfig, firmwareCode, environment).
 */
export function useAutosave(projectId: string | undefined) {
  const markSaving = useProjectsStore((s) => s.markSaving);
  const markSaved = useProjectsStore((s) => s.markSaved);
  const markSaveError = useProjectsStore((s) => s.markSaveError);
  const lastSerialized = useRef<string>("");

  useEffect(() => {
    if (!projectId) return;
    const id = setInterval(() => {
      const state = useProjectsStore.getState();
      const project = state.projects[projectId];
      if (!project) return;
      const payload = {
        conversation: project.conversation,
        robotSpec: project.robotSpec,
        selectedComponentIds: project.selectedComponentIds,
        simulationConfig: project.simulationConfig,
        firmwareCode: project.firmwareCode,
        environment: project.environment,
      };
      const serialized = JSON.stringify(payload);
      if (serialized === lastSerialized.current) return;
      lastSerialized.current = serialized;
      markSaving();
      updateProject(projectId, { state: payload as unknown })
        .then(() => markSaved())
        .catch(() => markSaveError());
    }, 2500);
    return () => clearInterval(id);
  }, [projectId, markSaved, markSaveError, markSaving]);
}
