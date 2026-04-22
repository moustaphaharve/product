export interface Template {
  id: string;
  name: string;
  oneLiner: string;
  prompt: string;
  accent: string;
  category: "ground" | "manipulator" | "aerial" | "education";
}

export const TEMPLATES: Template[] = [
  {
    id: "warehouse-amr",
    name: "Warehouse AMR",
    oneLiner: "Autonomous mobile robot for indoor fulfillment.",
    prompt:
      "Build a differential-drive autonomous mobile robot that can navigate a warehouse, pick up pallets, and avoid obstacles.",
    accent: "from-indigo-500/20 to-indigo-500/5",
    category: "ground",
  },
  {
    id: "pick-and-place-arm",
    name: "Pick-and-Place Arm",
    oneLiner: "6-DOF arm with a parallel-jaw gripper on a tabletop.",
    prompt:
      "Design a compact 6-DOF robot arm with a parallel-jaw gripper for pick-and-place on a tabletop.",
    accent: "from-emerald-500/20 to-emerald-500/5",
    category: "manipulator",
  },
  {
    id: "delivery-drone",
    name: "Delivery Drone",
    oneLiner: "Quadrotor with GPS waypoint following.",
    prompt:
      "Design a quadcopter delivery drone with GPS waypoint following and a 1kg payload bay.",
    accent: "from-sky-500/20 to-sky-500/5",
    category: "aerial",
  },
  {
    id: "inspection-rover",
    name: "Inspection Rover",
    oneLiner: "Skid-steer rover for outdoor inspection with lidar + camera.",
    prompt:
      "Build a skid-steer outdoor inspection rover with a 360° lidar, stereo camera, and 4-hour battery life.",
    accent: "from-amber-500/20 to-amber-500/5",
    category: "ground",
  },
  {
    id: "tabletop-manipulator",
    name: "Tabletop Manipulator",
    oneLiner: "Small 4-DOF arm, ideal for education and experimentation.",
    prompt:
      "Build a tabletop 4-DOF manipulator using SG90 servos, an ESP32 controller, and a 3D-printable frame.",
    accent: "from-rose-500/20 to-rose-500/5",
    category: "education",
  },
  {
    id: "outdoor-scout",
    name: "Outdoor Scout",
    oneLiner: "Tracked all-terrain scout with vision + GPS.",
    prompt:
      "Design a tracked all-terrain scout robot with a Jetson Orin Nano, RealSense depth camera, GPS module, and LiPo battery.",
    accent: "from-neutral-500/20 to-neutral-500/5",
    category: "ground",
  },
  {
    id: "balancing-robot",
    name: "Balancing Robot",
    oneLiner: "Two-wheeled self-balancing bot with an IMU PID loop.",
    prompt:
      "Design a two-wheel self-balancing robot with an IMU, brushed DC motors with encoders, and a PID controller on an ESP32.",
    accent: "from-violet-500/20 to-violet-500/5",
    category: "education",
  },
  {
    id: "tiny-quadruped",
    name: "Tiny Quadruped",
    oneLiner: "12-servo quadruped walker for learning gaits.",
    prompt:
      "Design a small quadruped walker with 12 MG996R servos, a PCA9685 driver, and a Raspberry Pi Zero 2 W for control.",
    accent: "from-teal-500/20 to-teal-500/5",
    category: "education",
  },
];
