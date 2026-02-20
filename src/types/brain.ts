import { z } from "zod";

// Zod schemas for validation
export const DecisionSchema = z.object({
  what: z.string(),
  why: z.string(),
  when: z.string(), // ISO date
  reversible: z.boolean(),
});

export const KeyFileSchema = z.object({
  path: z.string(),
  role: z.string(),
});

export const KnownIssueSchema = z.object({
  issue: z.string(),
  workaround: z.string(),
  severity: z.enum(["low", "medium", "high", "critical"]),
});

export const BrainStateSchema = z.object({
  version: z.string(),
  project: z.string(),
  lastUpdated: z.string(), // ISO 8601
  sessionCount: z.number(),

  facts: z.object({
    stack: z.array(z.string()),
    architecture: z.string(),
    environment: z.record(z.string()),
    custom: z.array(z.string()),
  }),

  decisions: z.array(DecisionSchema),

  activeState: z.object({
    currentGoal: z.string(),
    inProgress: z.array(z.string()),
    blockers: z.array(z.string()),
    recentlyCompleted: z.array(z.string()),
  }),

  keyFiles: z.array(KeyFileSchema),
  knownIssues: z.array(KnownIssueSchema),

  preferences: z.object({
    style: z.string(),
    constraints: z.array(z.string()),
    communication: z.string(),
  }),

  nextSteps: z.array(z.string()),
});

export const BrainConfigSchema = z.object({
  version: z.string(),
  saveSource: z.enum(["clipboard", "stdin", "file"]),
  loadTarget: z.enum(["clipboard", "stdout", "file"]),
  maxHistory: z.number(),
  gitIgnore: z.boolean(),
  extractTemplate: z.string().nullable(),
  injectTemplate: z.string().nullable(),
  autoDetectProject: z.boolean(),
});

export const StateDiffSchema = z.object({
  added: z.record(z.any()),
  modified: z.record(
    z.object({
      from: z.any(),
      to: z.any(),
    }),
  ),
  removed: z.record(z.any()),
});

export const SessionRecordSchema = z.object({
  session: z.number(),
  timestamp: z.string(),
  summary: z.string(),
  brainSnapshot: BrainStateSchema,
  diff: StateDiffSchema,
});

// TypeScript interfaces
export type Decision = z.infer<typeof DecisionSchema>;
export type KeyFile = z.infer<typeof KeyFileSchema>;
export type KnownIssue = z.infer<typeof KnownIssueSchema>;
export type BrainState = z.infer<typeof BrainStateSchema>;
export type BrainConfig = z.infer<typeof BrainConfigSchema>;
export type StateDiff = z.infer<typeof StateDiffSchema>;
export type SessionRecord = z.infer<typeof SessionRecordSchema>;

// Default empty brain state
export function createEmptyBrainState(projectName: string): BrainState {
  return {
    version: "1.0.0",
    project: projectName,
    lastUpdated: new Date().toISOString(),
    sessionCount: 0,
    facts: {
      stack: [],
      architecture: "",
      environment: {},
      custom: [],
    },
    decisions: [],
    activeState: {
      currentGoal: "",
      inProgress: [],
      blockers: [],
      recentlyCompleted: [],
    },
    keyFiles: [],
    knownIssues: [],
    preferences: {
      style: "",
      constraints: [],
      communication: "",
    },
    nextSteps: [],
  };
}

// Default config
export function createDefaultConfig(): BrainConfig {
  return {
    version: "1.0.0",
    saveSource: "clipboard",
    loadTarget: "clipboard",
    maxHistory: 50,
    gitIgnore: false,
    extractTemplate: null,
    injectTemplate: null,
    autoDetectProject: true,
  };
}
