import { AnimatePresence, motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  X,
  Package,
  Code2,
  Cable,
  Hammer,
  ExternalLink,
  Cpu,
} from "lucide-react";
import { cn } from "@product/ui";
import { useAppStore } from "../../store/app";
import { useProjectsStore } from "../../store/projects";
import { listComponents } from "../../lib/api";

export function Drawer({ projectId }: { projectId: string }) {
  const drawerOpen = useAppStore((s) => s.drawerOpen);
  const setDrawerOpen = useAppStore((s) => s.setDrawerOpen);
  const drawerTab = useAppStore((s) => s.drawerTab);
  const setDrawerTab = useAppStore((s) => s.setDrawerTab);

  return (
    <AnimatePresence>
      {drawerOpen && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="absolute bottom-0 left-0 right-0 h-[52%] bg-bg-secondary/95 backdrop-blur border-t border-border-primary/60 rounded-t-xl overflow-hidden flex flex-col z-20"
        >
          <div className="h-10 shrink-0 border-b border-border-primary/50 flex items-center justify-between px-2">
            <div className="flex items-center gap-0.5">
              <TabButton
                label="Components"
                icon={<Package size={13} />}
                active={drawerTab === "components"}
                onClick={() => setDrawerTab("components")}
              />
              <TabButton
                label="Firmware"
                icon={<Code2 size={13} />}
                active={drawerTab === "firmware"}
                onClick={() => setDrawerTab("firmware")}
              />
              <TabButton
                label="Wiring"
                icon={<Cable size={13} />}
                active={drawerTab === "wiring"}
                onClick={() => setDrawerTab("wiring")}
              />
              <TabButton
                label="Build"
                icon={<Hammer size={13} />}
                active={drawerTab === "build"}
                onClick={() => setDrawerTab("build")}
              />
            </div>
            <button
              onClick={() => setDrawerOpen(false)}
              className="h-7 w-7 rounded-md inline-flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-accent-subtle transition-colors duration-micro"
            >
              <X size={14} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {drawerTab === "components" && <ComponentsTab projectId={projectId} />}
            {drawerTab === "firmware" && <FirmwareTab projectId={projectId} />}
            {drawerTab === "wiring" && <WiringTab projectId={projectId} />}
            {drawerTab === "build" && <BuildTab projectId={projectId} />}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function TabButton({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "h-8 px-3 rounded-md text-sm inline-flex items-center gap-1.5 transition-colors duration-micro",
        active
          ? "bg-accent-subtle text-text-primary"
          : "text-text-secondary hover:text-text-primary hover:bg-accent-subtle",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function ComponentsTab({ projectId }: { projectId: string }) {
  const project = useProjectsStore((s) => s.projects[projectId]);
  const query = useQuery({
    queryKey: ["components"],
    queryFn: () => listComponents(),
  });
  const list = query.data ?? [];
  const spec = project?.robotSpec;

  const suggestions = spec
    ? list.slice(0, 12)
    : list.slice(0, 8);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-text-secondary">
          {spec
            ? `${suggestions.length} candidate parts matched to your spec`
            : "Browse the component library"}
        </div>
        <div className="text-xs text-text-tertiary">
          Click a part to swap it in
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {suggestions.map((c) => {
          const cheapest = [...c.suppliers].sort(
            (a, b) => a.priceUsd - b.priceUsd,
          )[0];
          return (
            <div
              key={c.id}
              className="rounded-lg border border-border-primary/50 bg-bg-tertiary/40 p-3 flex flex-col gap-2"
            >
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded bg-bg-tertiary border border-border-primary/60 flex items-center justify-center">
                  <Cpu size={13} className="text-text-tertiary" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-text-primary truncate">
                    {c.name}
                  </div>
                  <div className="text-[11px] text-text-tertiary truncate">
                    {c.manufacturer}
                  </div>
                </div>
              </div>
              <div className="text-[11px] text-text-secondary line-clamp-2 min-h-[26px]">
                {c.description}
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-text-primary font-mono">
                  {cheapest ? `$${cheapest.priceUsd.toFixed(2)}` : "—"}
                </div>
                {cheapest && (
                  <a
                    href={cheapest.purchaseUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-text-tertiary hover:text-text-primary transition-colors duration-micro inline-flex items-center gap-1"
                  >
                    {cheapest.name}
                    <ExternalLink size={10} />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FirmwareTab({ projectId }: { projectId: string }) {
  const project = useProjectsStore((s) => s.projects[projectId]);
  const code = project?.firmwareCode || sampleFirmware(project?.robotSpec?.category);

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-2 text-xs text-text-tertiary border-b border-border-primary/40 flex items-center justify-between">
        <span>firmware/main.{codeExtFor(project?.robotSpec?.category)}</span>
        <span>Auto-generated · read-only in this view</span>
      </div>
      <pre className="flex-1 overflow-auto p-4 text-[12.5px] leading-[1.55] font-mono text-text-primary whitespace-pre">
        {code}
      </pre>
    </div>
  );
}

function WiringTab({ projectId: _p }: { projectId: string }) {
  return (
    <div className="p-6 flex flex-col items-center justify-center h-full gap-3 text-text-secondary">
      <Cable size={24} className="text-text-tertiary" />
      <div className="text-sm">Wiring diagram preview</div>
      <div className="text-xs text-text-tertiary max-w-sm text-center">
        We'll render a clean, readable pinout between each component
        automatically. Generate a robot in the conversation to populate this
        view.
      </div>
    </div>
  );
}

function BuildTab({ projectId }: { projectId: string }) {
  const project = useProjectsStore((s) => s.projects[projectId]);
  const steps = [
    "Lay out all parts per the BOM and verify quantities.",
    "Assemble the chassis per the selected chassis entry.",
    "Mount actuators to their placements from the robot spec.",
    "Wire power through the PDB; confirm polarity before powering on.",
    "Flash the generated firmware onto the selected controller.",
    "Bring up the robot off the ground; test actuators individually.",
    "Re-run the simulation alongside the physical robot and tune.",
  ];
  return (
    <div className="p-6 max-w-3xl">
      <div className="text-sm text-text-secondary mb-4">
        Assembly instructions for {project?.name ?? "this build"}
      </div>
      <ol className="flex flex-col gap-3">
        {steps.map((s, i) => (
          <li
            key={i}
            className="flex gap-3 p-3 rounded-lg border border-border-primary/50 bg-bg-tertiary/30"
          >
            <div className="h-5 w-5 rounded-full bg-bg-tertiary border border-border-primary/60 text-[11px] text-text-secondary flex items-center justify-center shrink-0">
              {i + 1}
            </div>
            <div className="text-sm text-text-secondary">{s}</div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function codeExtFor(category?: string) {
  if (!category) return "ino";
  if (category.includes("arm") || category.includes("humanoid")) return "py";
  return "ino";
}

function sampleFirmware(category?: string) {
  if (category === "manipulator_arm") {
    return `# firmware/main.py — Product-generated manipulator firmware
import time
from adafruit_servokit import ServoKit

kit = ServoKit(channels=16)
JOINTS = ["base", "shoulder", "elbow", "wrist_roll", "wrist_pitch", "gripper"]

def home():
    for i, _ in enumerate(JOINTS):
        kit.servo[i].angle = 90

def move_to(angles):
    for i, a in enumerate(angles):
        kit.servo[i].angle = max(0, min(180, a))

if __name__ == "__main__":
    home()
    while True:
        move_to([90, 60, 120, 90, 90, 30])
        time.sleep(1.5)
        move_to([45, 90, 90, 90, 90, 90])
        time.sleep(1.5)
`;
  }
  return `// firmware/main.ino — Product-generated rover firmware
#include <Arduino.h>

constexpr uint8_t LEFT_MOTOR_IN1 = 5;
constexpr uint8_t LEFT_MOTOR_IN2 = 6;
constexpr uint8_t RIGHT_MOTOR_IN1 = 9;
constexpr uint8_t RIGHT_MOTOR_IN2 = 10;

constexpr uint8_t SONAR_TRIG = 2;
constexpr uint8_t SONAR_ECHO = 3;

void drive(int leftPwm, int rightPwm) {
  analogWrite(LEFT_MOTOR_IN1, max(0, leftPwm));
  analogWrite(LEFT_MOTOR_IN2, max(0, -leftPwm));
  analogWrite(RIGHT_MOTOR_IN1, max(0, rightPwm));
  analogWrite(RIGHT_MOTOR_IN2, max(0, -rightPwm));
}

long readDistanceCm() {
  digitalWrite(SONAR_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(SONAR_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(SONAR_TRIG, LOW);
  const long duration = pulseIn(SONAR_ECHO, HIGH, 25000);
  return duration / 58;
}

void setup() {
  pinMode(LEFT_MOTOR_IN1, OUTPUT);
  pinMode(LEFT_MOTOR_IN2, OUTPUT);
  pinMode(RIGHT_MOTOR_IN1, OUTPUT);
  pinMode(RIGHT_MOTOR_IN2, OUTPUT);
  pinMode(SONAR_TRIG, OUTPUT);
  pinMode(SONAR_ECHO, INPUT);
  Serial.begin(115200);
}

void loop() {
  const long distance = readDistanceCm();
  if (distance > 0 && distance < 30) {
    drive(-120, 120); // turn in place
  } else {
    drive(180, 180);  // forward
  }
  delay(40);
}
`;
}
