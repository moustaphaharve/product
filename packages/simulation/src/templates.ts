import type { EnvironmentType } from "@product/types";

/**
 * Five hand-crafted MJCF scene templates.
 *
 * These are runnable-shape scenes — simple enough to bring up fast, rich
 * enough to showcase the viewport atmosphere. The physics worker overlays
 * the robot spec onto whichever scene the user picks.
 */

const EMPTY_MJCF = `<?xml version="1.0" encoding="utf-8"?>
<mujoco model="empty_ground">
  <option timestep="0.002" gravity="0 0 -9.81"/>
  <asset>
    <texture name="grid" type="2d" builtin="checker" rgb1=".1 .1 .1" rgb2=".12 .12 .12" width="300" height="300"/>
    <material name="grid" texture="grid" texrepeat="10 10" texuniform="true"/>
  </asset>
  <worldbody>
    <light directional="true" pos="0 0 6" dir="0 0 -1" diffuse="0.7 0.7 0.7"/>
    <geom name="floor" type="plane" size="50 50 0.1" material="grid"/>
  </worldbody>
</mujoco>`;

const WAREHOUSE_MJCF = `<?xml version="1.0" encoding="utf-8"?>
<mujoco model="warehouse">
  <option timestep="0.002" gravity="0 0 -9.81"/>
  <asset>
    <texture name="concrete" type="2d" builtin="flat" rgb1=".18 .18 .19" width="64" height="64"/>
    <material name="concrete" texture="concrete"/>
    <material name="metal" rgba=".35 .35 .38 1"/>
    <material name="pallet" rgba=".42 .28 .18 1"/>
  </asset>
  <worldbody>
    <light directional="true" pos="0 0 8" dir="0 0 -1" diffuse="0.8 0.8 0.8"/>
    <geom name="floor" type="plane" size="30 30 0.1" material="concrete"/>
    <body name="shelf_a" pos="4 0 1"><geom type="box" size="0.2 3 1" material="metal"/></body>
    <body name="shelf_b" pos="-4 0 1"><geom type="box" size="0.2 3 1" material="metal"/></body>
    <body name="pallet_1" pos="1 2 0.1"><geom type="box" size="0.5 0.5 0.1" material="pallet"/></body>
    <body name="pallet_2" pos="-1.5 -2 0.1"><geom type="box" size="0.5 0.5 0.1" material="pallet"/></body>
    <body name="ramp" pos="6 0 0.25" euler="0 -12 0"><geom type="box" size="1.5 1.5 0.03" material="metal"/></body>
  </worldbody>
</mujoco>`;

const OUTDOOR_MJCF = `<?xml version="1.0" encoding="utf-8"?>
<mujoco model="outdoor_path">
  <option timestep="0.002" gravity="0 0 -9.81"/>
  <asset>
    <texture name="grass" type="2d" builtin="flat" rgb1=".14 .22 .14" width="64" height="64"/>
    <material name="grass" texture="grass"/>
    <material name="dirt" rgba=".32 .24 .18 1"/>
    <material name="rock" rgba=".38 .38 .4 1"/>
  </asset>
  <worldbody>
    <light directional="true" pos="3 3 8" dir="-0.3 -0.3 -1" diffuse="0.9 0.9 0.85"/>
    <geom name="floor" type="plane" size="50 50 0.1" material="grass"/>
    <geom name="path" type="box" pos="0 0 0.01" size="1 20 0.02" material="dirt"/>
    <body name="rock_1" pos="3 2 0.2"><geom type="sphere" size="0.2" material="rock"/></body>
    <body name="rock_2" pos="-2.5 -3 0.15"><geom type="sphere" size="0.15" material="rock"/></body>
    <body name="incline" pos="0 10 0.3" euler="8 0 0"><geom type="box" size="2 4 0.05" material="dirt"/></body>
  </worldbody>
</mujoco>`;

const TABLETOP_MJCF = `<?xml version="1.0" encoding="utf-8"?>
<mujoco model="tabletop">
  <option timestep="0.002" gravity="0 0 -9.81"/>
  <asset>
    <material name="wood" rgba=".55 .38 .22 1"/>
    <material name="object_a" rgba=".9 .3 .25 1"/>
    <material name="object_b" rgba=".25 .5 .9 1"/>
    <material name="object_c" rgba=".4 .85 .45 1"/>
  </asset>
  <worldbody>
    <light directional="true" pos="1 1 3" dir="-0.3 -0.3 -1" diffuse="0.9 0.9 0.9"/>
    <geom name="table" type="box" pos="0 0 0.75" size="0.8 0.5 0.025" material="wood"/>
    <body name="obj_red" pos="0.2 0 0.82"><geom type="box" size="0.04 0.04 0.04" material="object_a"/></body>
    <body name="obj_blue" pos="0 0.15 0.82"><geom type="cylinder" size="0.04 0.04" material="object_b"/></body>
    <body name="obj_green" pos="-0.2 -0.1 0.84"><geom type="sphere" size="0.05" material="object_c"/></body>
  </worldbody>
</mujoco>`;

const FLIGHT_MJCF = `<?xml version="1.0" encoding="utf-8"?>
<mujoco model="flight_space">
  <option timestep="0.002" gravity="0 0 -9.81" wind="0 0 0"/>
  <asset>
    <material name="grid" rgba=".08 .08 .09 1"/>
  </asset>
  <worldbody>
    <light directional="true" pos="0 0 10" dir="0 0 -1" diffuse="0.8 0.8 0.9"/>
    <geom name="floor" type="plane" size="25 25 0.1" material="grid"/>
    <body name="marker_n" pos="0 10 0.5"><geom type="cylinder" size="0.1 0.5" rgba="1 0.3 0.3 1"/></body>
    <body name="marker_e" pos="10 0 0.5"><geom type="cylinder" size="0.1 0.5" rgba="0.3 1 0.3 1"/></body>
    <body name="marker_s" pos="0 -10 0.5"><geom type="cylinder" size="0.1 0.5" rgba="0.3 0.3 1 1"/></body>
    <body name="marker_w" pos="-10 0 0.5"><geom type="cylinder" size="0.1 0.5" rgba="1 0.9 0.3 1"/></body>
  </worldbody>
</mujoco>`;

export const SCENE_TEMPLATES: Record<EnvironmentType, string> = {
  empty: EMPTY_MJCF,
  warehouse: WAREHOUSE_MJCF,
  outdoor_path: OUTDOOR_MJCF,
  tabletop: TABLETOP_MJCF,
  flight_space: FLIGHT_MJCF,
};

export function getSceneTemplate(env: EnvironmentType): string {
  return SCENE_TEMPLATES[env] ?? EMPTY_MJCF;
}
