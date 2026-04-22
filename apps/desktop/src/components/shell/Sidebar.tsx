import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  Sparkles,
  Cpu,
  Settings,
  HelpCircle,
  LogOut,
  MoreHorizontal,
  Star,
  Bot,
  ChevronDown,
  ChevronRight,
  Archive,
  Copy,
  Trash2,
  Edit3,
} from "lucide-react";
import { Button, Tooltip, cn } from "@product/ui";
import {
  archiveProject,
  createProject,
  deleteProject,
  duplicateProject,
  listProjects,
  updateProject,
} from "../../lib/api";
import { useAppStore } from "../../store/app";
import type { ProjectSummary } from "@product/types";

const formatRelative = (iso: string) => {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
};

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const collapsed = useAppStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const setCommandPaletteOpen = useAppStore((s) => s.setCommandPaletteOpen);
  const [libraryOpen, setLibraryOpen] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    id: string;
    x: number;
    y: number;
  } | null>(null);

  const qc = useQueryClient();
  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: listProjects,
    refetchInterval: 10_000,
  });

  const createMut = useMutation({
    mutationFn: async () => createProject({ name: "Untitled build" }),
    onSuccess: (p) => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      navigate(`/projects/${p.id}`);
    },
  });

  useEffect(() => {
    const close = () => setContextMenu(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 56 : 240 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="relative h-full bg-bg-secondary border-r border-border-primary/50 flex flex-col shrink-0"
    >
      {/* Top ù logo + new + search */}
      <div className="p-3 flex flex-col gap-2 border-b border-border-primary/50">
        <div
          className={cn(
            "flex items-center gap-2 h-8",
            collapsed ? "justify-center" : "justify-between",
          )}
        >
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-micro"
          >
            <LogoMark />
            {!collapsed && (
              <span className="text-md font-medium tracking-tight">
                Product
              </span>
            )}
          </button>
          {!collapsed && (
            <Tooltip content="Collapse sidebar" side="bottom">
              <button
                onClick={toggleSidebar}
                className="h-7 w-7 inline-flex items-center justify-center rounded-md text-text-tertiary hover:text-text-primary hover:bg-accent-subtle transition-colors duration-micro"
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose size={14} />
              </button>
            </Tooltip>
          )}
        </div>

        {collapsed ? (
          <Tooltip content="New project" side="right">
            <button
              onClick={() => createMut.mutate()}
              className="h-9 w-9 mx-auto inline-flex items-center justify-center rounded-md bg-text-primary text-bg-primary hover:bg-text-primary/90 transition-colors duration-micro"
              aria-label="New project"
            >
              <Plus size={16} />
            </button>
          </Tooltip>
        ) : (
          <Button
            variant="primary"
            size="md"
            onClick={() => createMut.mutate()}
            className="w-full justify-start"
          >
            <Plus size={14} />
            <span>New project</span>
          </Button>
        )}

        {collapsed ? (
          <Tooltip content="Search (?K)" side="right">
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="h-9 w-9 mx-auto inline-flex items-center justify-center rounded-md text-text-tertiary hover:text-text-primary hover:bg-accent-subtle transition-colors duration-micro"
              aria-label="Search"
            >
              <Search size={15} />
            </button>
          </Tooltip>
        ) : (
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="w-full h-8 px-2.5 rounded-md bg-bg-input border border-border-primary/50 flex items-center gap-2 text-text-tertiary hover:text-text-secondary hover:border-border-secondary/60 transition-colors duration-micro"
          >
            <Search size={13} />
            <span className="text-sm flex-1 text-left">Searchù</span>
            <kbd className="text-xs text-text-tertiary font-mono">?K</kbd>
          </button>
        )}
      </div>

      {/* Middle ù Recent projects */}
      <div className="flex-1 overflow-y-auto py-2">
        {!collapsed && (
          <div className="px-3 pt-1 pb-2 text-xs uppercase tracking-wider text-text-tertiary font-medium">
            Recent
          </div>
        )}
        <div className="flex flex-col gap-0.5 px-2">
          {projectsQuery.isLoading && (
            <div className="px-2 py-1 text-xs text-text-tertiary">
              {collapsed ? "" : "Loadingù"}
            </div>
          )}
          {(projectsQuery.data ?? [])
            .filter((p) => !p.archivedAt)
            .slice(0, 10)
            .map((p) => (
              <ProjectItem
                key={p.id}
                project={p}
                collapsed={collapsed}
                active={location.pathname === `/projects/${p.id}`}
                onOpenContext={(x, y) => setContextMenu({ id: p.id, x, y })}
              />
            ))}
          {!collapsed &&
            (projectsQuery.data?.length ?? 0) === 0 &&
            !projectsQuery.isLoading && (
              <div className="px-2 py-4 text-xs text-text-tertiary italic">
                No projects yet. Start with a prompt on the home screen.
              </div>
            )}
        </div>

        {/* Library */}
        {!collapsed && (
          <div className="mt-4 pt-3 border-t border-border-primary/40">
            <button
              onClick={() => setLibraryOpen((v) => !v)}
              className="w-full px-3 py-1 flex items-center gap-1.5 text-xs uppercase tracking-wider text-text-tertiary font-medium hover:text-text-secondary transition-colors duration-micro"
            >
              {libraryOpen ? (
                <ChevronDown size={12} />
              ) : (
                <ChevronRight size={12} />
              )}
              <span>Library</span>
            </button>
            <AnimatePresence initial={false}>
              {libraryOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-2 flex flex-col gap-0.5">
                    <LibraryItem
                      icon={<Sparkles size={13} />}
                      label="Templates"
                      onClick={() => navigate("/")}
                    />
                    <LibraryItem
                      icon={<Cpu size={13} />}
                      label="Components"
                      onClick={() => setCommandPaletteOpen(true)}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Bottom ù user avatar / account menu */}
      <div className="p-2 border-t border-border-primary/50 relative">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className={cn(
            "w-full rounded-md px-2 py-1.5 flex items-center gap-2 hover:bg-accent-subtle transition-colors duration-micro",
            collapsed && "justify-center px-0",
          )}
        >
          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-neutral-300 to-neutral-600 flex items-center justify-center text-[11px] font-medium text-black">
            Y
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0 text-left">
                <div className="text-sm text-text-primary truncate">
                  You
                </div>
                <div className="text-[11px] text-text-tertiary truncate">
                  Free plan
                </div>
              </div>
              <MoreHorizontal size={14} className="text-text-tertiary" />
            </>
          )}
        </button>
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-14 left-2 right-2 bg-bg-tertiary border border-border-primary/60 rounded-lg shadow-xl p-1 z-40"
            >
              <MenuItem
                icon={<Settings size={13} />}
                label="Settings"
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/settings");
                }}
              />
              <MenuItem
                icon={<Star size={13} />}
                label="Billing"
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/settings/billing");
                }}
              />
              <MenuItem
                icon={<HelpCircle size={13} />}
                label="Help"
                onClick={() => setMenuOpen(false)}
              />
              <div className="my-1 h-px bg-border-primary/40" />
              <MenuItem
                icon={<LogOut size={13} />}
                label="Sign out"
                onClick={() => {
                  setMenuOpen(false);
                  useAppStore.getState().setStage("welcome");
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {collapsed && (
        <Tooltip content="Expand sidebar" side="right">
          <button
            onClick={toggleSidebar}
            className="absolute top-2 right-[-12px] h-6 w-6 rounded-full bg-bg-tertiary border border-border-primary/60 flex items-center justify-center text-text-tertiary hover:text-text-primary transition-colors duration-micro shadow-md"
            aria-label="Expand sidebar"
          >
            <PanelLeftOpen size={12} />
          </button>
        </Tooltip>
      )}

      {/* Context menu for project items */}
      {contextMenu && (
        <ContextMenu
          projectId={contextMenu.id}
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
        />
      )}
    </motion.aside>
  );
}

function LogoMark() {
  return (
    <div className="h-6 w-6 rounded bg-gradient-to-br from-white via-neutral-300 to-neutral-500 flex items-center justify-center">
      <Bot size={13} className="text-black" />
    </div>
  );
}

function LibraryItem({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-text-secondary hover:text-text-primary hover:bg-accent-subtle transition-colors duration-micro"
    >
      {icon}
      <span className="truncate">{label}</span>
    </button>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-text-secondary hover:text-text-primary hover:bg-accent-subtle transition-colors duration-micro"
    >
      <span className="text-text-tertiary">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function ProjectItem({
  project,
  collapsed,
  active,
  onOpenContext,
}: {
  project: ProjectSummary;
  collapsed: boolean;
  active: boolean;
  onOpenContext: (x: number, y: number) => void;
}) {
  const content = (
    <Link
      to={`/projects/${project.id}`}
      onContextMenu={(e) => {
        e.preventDefault();
        onOpenContext(e.clientX, e.clientY);
      }}
      className={cn(
        "group w-full flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent-subtle transition-colors duration-micro",
        active && "bg-accent-subtle",
        collapsed && "justify-center",
      )}
    >
      <div className="h-5 w-5 rounded bg-bg-tertiary border border-border-primary/60 flex items-center justify-center shrink-0">
        <Bot size={11} className="text-text-tertiary" />
      </div>
      {!collapsed && (
        <>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-text-primary truncate font-normal">
              {project.name}
            </div>
            <div className="text-[11px] text-text-tertiary truncate">
              {formatRelative(project.updatedAt)}
            </div>
          </div>
          <MoreHorizontal
            size={13}
            className="opacity-0 group-hover:opacity-100 text-text-tertiary transition-opacity duration-micro"
          />
        </>
      )}
    </Link>
  );
  if (collapsed) {
    return (
      <Tooltip content={project.name} side="right">
        {content}
      </Tooltip>
    );
  }
  return content;
}

function ContextMenu({
  projectId,
  x,
  y,
  onClose,
}: {
  projectId: string;
  x: number;
  y: number;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const nav = useNavigate();
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState("");

  const call = async (fn: () => Promise<unknown>) => {
    await fn();
    await qc.invalidateQueries({ queryKey: ["projects"] });
    onClose();
  };

  return (
    <div
      className="fixed z-50 bg-bg-tertiary border border-border-primary/60 rounded-lg shadow-2xl p-1 min-w-[180px] animate-fadeIn"
      style={{ top: y, left: x }}
      onClick={(e) => e.stopPropagation()}
    >
      {renaming ? (
        <div className="p-1">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={async (e) => {
              if (e.key === "Enter") {
                await call(async () => {
                  await updateProject(projectId, { name });
                });
              } else if (e.key === "Escape") onClose();
            }}
            placeholder="New name"
            className="h-7 w-full rounded bg-bg-input border border-border-primary/60 px-2 text-sm"
          />
        </div>
      ) : (
        <>
          <MenuItem
            icon={<Edit3 size={13} />}
            label="Rename"
            onClick={() => setRenaming(true)}
          />
          <MenuItem
            icon={<Copy size={13} />}
            label="Duplicate"
            onClick={() =>
              call(async () => {
                const p = await duplicateProject(projectId);
                if (p) nav(`/projects/${p.id}`);
              })
            }
          />
          <MenuItem
            icon={<Archive size={13} />}
            label="Archive"
            onClick={() => call(() => archiveProject(projectId))}
          />
          <div className="my-1 h-px bg-border-primary/40" />
          <MenuItem
            icon={<Trash2 size={13} />}
            label="Delete"
            onClick={() => call(() => deleteProject(projectId))}
          />
        </>
      )}
    </div>
  );
}
