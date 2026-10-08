import { migration as trainingPlans } from "./002-training-plans";
import { migration as exerciseCatalog } from "./003-exercise-catalog";
import { migration as machineGuides } from "./004-machine-guides";
export interface Migration {
  version: number;
  name: string;
  sql: string;
}
// Version 2 is preserved for databases created before this refactor.
export const migrations: readonly Migration[] = [
  { version: 2, name: "training-plans", sql: trainingPlans },
  { version: 3, name: "exercise-catalog", sql: exerciseCatalog },
  { version: 4, name: "machine-guides", sql: machineGuides },
];
