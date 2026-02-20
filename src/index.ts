// Public API — re-export core types and functions for programmatic use
export type {
  BrainState,
  BrainConfig,
  Decision,
  KeyFile,
  KnownIssue,
  SessionRecord,
  StateDiff,
} from "./types/brain.js";

export {
  BrainStateSchema,
  BrainConfigSchema,
  createEmptyBrainState,
  createDefaultConfig,
} from "./types/brain.js";

export { loadBrain, saveBrain, loadConfig, createInitialBrain } from "./core/brain.js";
export { mergeBrainState } from "./core/merger.js";
export { validateBrainState, validateBrainConfig } from "./core/validator.js";
export {
  formatBrainForDisplay,
  formatBrainForInjection,
  formatCompact,
  formatSection,
} from "./core/formatter.js";
