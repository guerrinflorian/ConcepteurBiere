import { UiMode } from "./types";

/** Raccourci : vrai si le mode est "beginner" */
export function isBeginner(mode: UiMode): boolean {
  return mode === "beginner";
}

/** Raccourci : vrai si le mode est "expert" */
export function isExpert(mode: UiMode): boolean {
  return mode === "expert";
}
