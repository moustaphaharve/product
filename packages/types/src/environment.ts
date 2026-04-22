import { z } from "zod";

export const environmentTypeSchema = z.enum([
  "empty",
  "warehouse",
  "outdoor_path",
  "tabletop",
  "flight_space",
]);

export type EnvironmentType = z.infer<typeof environmentTypeSchema>;

export const ENVIRONMENT_OPTIONS: Array<{
  value: EnvironmentType;
  label: string;
  description: string;
}> = [
  { value: "empty", label: "Empty", description: "Flat ground, open sky" },
  {
    value: "warehouse",
    label: "Warehouse",
    description: "Indoor shelves, ramps, pallets",
  },
  {
    value: "outdoor_path",
    label: "Outdoor path",
    description: "Grass, dirt, incline",
  },
  {
    value: "tabletop",
    label: "Tabletop",
    description: "Desk with small objects for manipulation",
  },
  {
    value: "flight_space",
    label: "Flight space",
    description: "Open 3D flight volume for drones",
  },
];
