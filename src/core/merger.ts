import type {
  BrainState,
  Decision,
  KeyFile,
  KnownIssue,
  StateDiff,
} from "../types/brain.js";

// Union two string arrays, removing duplicates
function union(a: string[], b: string[]): string[] {
  return [...new Set([...a, ...b])];
}

// Upsert array of objects by a key field
function upsertByField<T extends Record<string, unknown>>(
  existing: T[],
  incoming: T[],
  key: keyof T,
): T[] {
  const map = new Map(existing.map((item) => [String(item[key]), item]));
  for (const item of incoming) {
    map.set(String(item[key]), item);
  }
  return Array.from(map.values());
}

// Keep only the last N items
function slidingWindow<T>(items: T[], maxSize: number): T[] {
  const unique = [...new Set(items)];
  return unique.slice(-maxSize);
}

// Deep merge objects
function deepMerge(
  existing: Record<string, string>,
  incoming: Record<string, string>,
): Record<string, string> {
  return { ...existing, ...incoming };
}

// Deduplicate strings that are very similar
function deduplicateByContent(items: string[]): string[] {
  const unique: string[] = [];
  for (const item of items) {
    const normalized = item.toLowerCase().trim();
    const isDuplicate = unique.some(
      (existing) => existing.toLowerCase().trim() === normalized,
    );
    if (!isDuplicate) unique.push(item);
  }
  return unique;
}

// Merge decisions - update existing by "what" field
function mergeDecisions(
  existing: Decision[],
  incoming: Decision[],
): Decision[] {
  return upsertByField(existing, incoming, "what");
}

// Merge key files - update by path
function mergeKeyFiles(existing: KeyFile[], incoming: KeyFile[]): KeyFile[] {
  return upsertByField(existing, incoming, "path");
}

// Merge known issues - upsert by issue text
function mergeKnownIssues(
  existing: KnownIssue[],
  incoming: KnownIssue[],
): KnownIssue[] {
  return upsertByField(existing, incoming, "issue");
}

// Calculate diff between states
function calculateDiff(existing: BrainState, incoming: BrainState): StateDiff {
  const diff: StateDiff = {
    added: {},
    modified: {},
    removed: {},
  };

  // Check facts.custom
  const newFacts = incoming.facts.custom.filter(
    (f: string) => !existing.facts.custom.includes(f),
  );
  if (newFacts.length > 0) {
    diff.added["facts.custom"] = newFacts;
  }

  // Check decisions
  const newDecisions = incoming.decisions.filter(
    (d: Decision) =>
      !existing.decisions.some((ed: Decision) => ed.what === d.what),
  );
  const updatedDecisions = incoming.decisions.filter((d: Decision) =>
    existing.decisions.some(
      (ed: Decision) => ed.what === d.what && ed.why !== d.why,
    ),
  );
  if (newDecisions.length > 0) {
    diff.added["decisions"] = newDecisions;
  }
  if (updatedDecisions.length > 0) {
    for (const d of updatedDecisions) {
      const old = existing.decisions.find((ed: Decision) => ed.what === d.what);
      if (old) {
        diff.modified[`decisions.${d.what}`] = { from: old.why, to: d.why };
      }
    }
  }

  // Check active state changes
  if (existing.activeState.currentGoal !== incoming.activeState.currentGoal) {
    diff.modified["activeState.currentGoal"] = {
      from: existing.activeState.currentGoal,
      to: incoming.activeState.currentGoal,
    };
  }

  // Check key files
  const newKeyFiles = incoming.keyFiles.filter(
    (kf: KeyFile) =>
      !existing.keyFiles.some((ekf: KeyFile) => ekf.path === kf.path),
  );
  if (newKeyFiles.length > 0) {
    diff.added["keyFiles"] = newKeyFiles;
  }

  return diff;
}

export function mergeBrainState(
  existing: BrainState,
  incoming: BrainState,
): { merged: BrainState; diff: StateDiff } {
  const diff = calculateDiff(existing, incoming);

  const merged: BrainState = {
    // Metadata
    version: existing.version,
    project: existing.project,
    lastUpdated: new Date().toISOString(),
    sessionCount: existing.sessionCount + 1,

    // Facts — accumulate knowledge
    facts: {
      stack: union(existing.facts.stack, incoming.facts.stack),
      architecture: incoming.facts.architecture || existing.facts.architecture,
      environment: deepMerge(
        existing.facts.environment,
        incoming.facts.environment,
      ),
      custom: deduplicateByContent([
        ...existing.facts.custom,
        ...incoming.facts.custom,
      ]),
    },

    // Decisions — append new, update existing
    decisions: mergeDecisions(existing.decisions, incoming.decisions),

    // Active State — mostly replace with current
    activeState: {
      currentGoal: incoming.activeState.currentGoal,
      inProgress: incoming.activeState.inProgress,
      blockers: incoming.activeState.blockers,
      recentlyCompleted: slidingWindow(
        [
          ...existing.activeState.recentlyCompleted,
          ...incoming.activeState.recentlyCompleted,
        ],
        10,
      ),
    },

    // Key Files — upsert by path
    keyFiles: mergeKeyFiles(existing.keyFiles, incoming.keyFiles),

    // Known Issues — upsert, with removal support
    knownIssues: mergeKnownIssues(existing.knownIssues, incoming.knownIssues),

    // Preferences — deep merge
    preferences: {
      ...existing.preferences,
      ...incoming.preferences,
      constraints: union(
        existing.preferences.constraints,
        incoming.preferences.constraints,
      ),
    },

    // Next Steps — always use latest
    nextSteps: incoming.nextSteps,
  };

  return { merged, diff };
}
