import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../store/app";
import { useProjectsStore } from "../store/projects";
import {
  archiveProject,
  createProject,
  deleteProject,
  duplicateProject,
} from "../lib/api";

/**
 * Bridges the Electron native menu bar to app actions.
 * When running in a browser, `window.product` is undefined and the hook
 * becomes a no-op.
 */
export function useMenuBridge() {
  const navigate = useNavigate();

  useEffect(() => {
    const anyWindow = window as unknown as {
      product?: { onMenu?: (cb: (cmd: string) => void) => () => void };
    };
    if (!anyWindow.product?.onMenu) return;
    const off = anyWindow.product.onMenu(async (cmd: string) => {
      switch (cmd) {
        case "new-project": {
          const p = await createProject({ name: "Untitled build" });
          navigate(`/projects/${p.id}`);
          break;
        }
        case "open-settings":
          navigate("/settings");
          break;
        case "toggle-sidebar":
          useAppStore.getState().toggleSidebar();
          break;
        case "toggle-drawer":
          useAppStore.getState().toggleDrawer();
          break;
        case "close-project":
          navigate("/");
          break;
        case "export": {
          const id = useProjectsStore.getState().activeProjectId;
          if (id) {
            window.open(
              `${import.meta.env.VITE_API_URL ?? "http://localhost:4000"}/v1/projects/${id}/export`,
              "_blank",
            );
          }
          break;
        }
        case "duplicate-project": {
          const id = useProjectsStore.getState().activeProjectId;
          if (id) {
            const p = await duplicateProject(id);
            if (p) navigate(`/projects/${p.id}`);
          }
          break;
        }
        case "delete-project": {
          const id = useProjectsStore.getState().activeProjectId;
          if (id) {
            await deleteProject(id);
            navigate("/");
          }
          break;
        }
        default:
          break;
      }
    });
    return off;
  }, [navigate]);
}
