# Brain State Schema Reference

Full reference for the `brain.json` file structure.

## Top-Level Fields

| Field | Type | Description |
|-------|------|-------------|
| `version` | `string` | Schema version (managed by llm-brain) |
| `project` | `string` | Project name (auto-detected from package.json or git) |
| `lastUpdated` | `string` | ISO 8601 timestamp of last save |
| `sessionCount` | `number` | Number of sessions recorded |

---

## `facts` — Accumulated Project Truths

```jsonc
"facts": {
  "stack": ["TypeScript", "Express"],      // tech stack — grows, never shrinks
  "architecture": "Monolith",              // latest description wins
  "environment": { "os": "macOS" },        // key/value pairs, deep-merged
  "custom": ["API runs on port 3000"]      // any other facts, deduplicated
}
```

---

## `decisions` — What Was Decided and Why

```jsonc
"decisions": [
  {
    "what": "Use PostgreSQL over MongoDB",
    "why": "Data is relational",
    "when": "2026-02-15",        // ISO date
    "reversible": true
  }
]
```
Decisions are **upserted by `what`** — updating the same decision updates its `why`.

---

## `activeState` — Current Working State

```jsonc
"activeState": {
  "currentGoal": "Add WebSocket support",       // always replaced with latest
  "inProgress": ["WS handler debugging"],       // always replaced with latest
  "blockers": ["WS drops after 30s idle"],      // always replaced with latest
  "recentlyCompleted": ["Error handling", "Zod"] // sliding window, last 10 kept
}
```

---

## `keyFiles` — Important File Map

```jsonc
"keyFiles": [
  { "path": "src/index.ts", "role": "Main server entry point" }
]
```
Upserted by `path` — adding the same path updates its `role`.

---

## `knownIssues` — Bugs and Workarounds

```jsonc
"knownIssues": [
  {
    "issue": "pg module import fails in ESM mode",
    "workaround": "Using createRequire",
    "severity": "low"            // "low" | "medium" | "high" | "critical"
  }
]
```
Upserted by `issue` text.

---

## `preferences` — User Working Style

```jsonc
"preferences": {
  "style": "Learning by doing",
  "constraints": ["$0 cost only", "No paid services"],
  "communication": "Explain reasoning, not just code"
}
```

---

## `nextSteps` — Priority Queue

```jsonc
"nextSteps": [
  "Fix WebSocket idle timeout",
  "Add rate limiting middleware",
  "Write integration tests"
]
```
Always **fully replaced** by the latest session — only current priorities matter.

---

## Merge Behavior Summary

| Field | On Save |
|-------|---------|
| `facts.stack` | Union (grows only) |
| `facts.architecture` | Replace |
| `facts.environment` | Deep merge |
| `facts.custom` | Union + deduplicate |
| `decisions` | Upsert by `what` |
| `activeState.currentGoal` | Replace |
| `activeState.inProgress` | Replace |
| `activeState.blockers` | Replace |
| `activeState.recentlyCompleted` | Union, keep last 10 |
| `keyFiles` | Upsert by `path` |
| `knownIssues` | Upsert by `issue` |
| `preferences` | Deep merge |
| `nextSteps` | Replace |
