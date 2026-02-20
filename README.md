# llm-brain

> **A portable memory layer for LLM conversations.**

Every time you start a new LLM chat, all context is lost. `llm-brain` fixes that. It gives your LLM a persistent, structured state file that accumulates decisions, progress, goals, and facts across sessions.

---

## How It Works

At the **end** of a conversation, you ask your LLM to generate a brain state snapshot. `llm-brain save` merges it into a growing state file. At the **start** of any new conversation, `llm-brain load` copies the full context to your clipboard. Paste it in and the LLM instantly has complete continuity.

```
End of chat  ->  Ask LLM to generate brain state  ->  llm-brain save
New chat     ->  llm-brain load  ->  Paste  ->  LLM remembers everything
```

---

## Prerequisites

- Node.js >= 18.0.0

---

## Installation

Install globally to make the `llm-brain` command available system-wide:

```bash
npm install -g llm-brain
```

> **Note:** Global installation (`-g`) is required for the CLI. A local install (`npm install llm-brain`) will not register the command on your PATH. If you prefer not to install globally, you can use `npx llm-brain` instead.

---

## Quick Start

### 1. Initialize in your project

```bash
cd my-project
llm-brain init
```

This creates a `.llm-brain/` directory with the following structure:

```
.llm-brain/
  brain.json         -- The persistent state file
  config.json        -- Configuration preferences
  history/           -- Snapshot archive of each session
  templates/         -- Prompt templates
```

### 2. Get the extraction prompt

```bash
llm-brain template show extract
```

Copy this prompt. At the **end** of any LLM conversation, paste it in and ask the LLM to generate your brain state as JSON.

### 3. Save the brain state

After your LLM generates the JSON, copy it to your clipboard, then run:

```bash
llm-brain save
```

Or pipe it directly:

```bash
llm-brain save --from stdin < state.json
```

### 4. Load context into a new conversation

```bash
llm-brain load
```

Your full context is now on your clipboard. Paste it at the start of your new chat and the LLM will have complete context to continue where you left off.

---

## Commands

### `llm-brain init`

Initialize `.llm-brain/` in the current project directory.

```bash
llm-brain init
```

---

### `llm-brain save`

Save and merge a new brain state.

```bash
llm-brain save                                    # Read from clipboard (default)
llm-brain save --from stdin                       # Read from piped stdin
llm-brain save --from file --file ./state.json    # Read from a file
llm-brain save --replace                          # Replace instead of merging
```

---

### `llm-brain load`

Load the brain state for a new conversation.

```bash
llm-brain load                      # Copy to clipboard (default)
llm-brain load --to stdout          # Print to terminal
llm-brain load --session 3          # Load from session #3
```

---

### `llm-brain show`

Display the current brain state in a readable format.

```bash
llm-brain show                      # Pretty-printed view
llm-brain show --json               # Raw JSON
llm-brain show --compact            # One-line summary
llm-brain show --section decisions  # Show a specific section
```

Available sections: `facts`, `decisions`, `activeState`, `keyFiles`, `knownIssues`, `preferences`, `nextSteps`

---

### `llm-brain history`

List all saved sessions.

```bash
llm-brain history                   # Show last 10 sessions
llm-brain history --limit 5         # Show last 5 sessions
```

---

### `llm-brain reset`

Reset the brain state.

```bash
llm-brain reset                     # Full reset (prompts for confirmation)
llm-brain reset --keep-config       # Reset state only, keep config
llm-brain reset --yes               # Skip confirmation prompt
```

---

### `llm-brain template`

Manage prompt templates.

```bash
llm-brain template show extract     # Show the extraction prompt
llm-brain template show inject      # Show the injection prompt
llm-brain template reset            # Reset templates to defaults
```

---

## Brain State Schema

The `brain.json` file is a structured JSON document with seven layers:

```jsonc
{
  "version": "1.0.1",
  "project": "my-project",
  "sessionCount": 7,

  // FACTS -- project truths that accumulate over time
  "facts": {
    "stack": ["TypeScript", "Express", "PostgreSQL"],
    "architecture": "Monolith",
    "environment": { "os": "macOS", "node": "20.x" },
    "custom": ["API on port 3000", "ESM modules"]
  },

  // DECISIONS -- what was decided and why
  "decisions": [
    { "what": "Use PostgreSQL", "why": "Relational data fits", "when": "2026-02-15", "reversible": true }
  ],

  // ACTIVE STATE -- what is happening right now
  "activeState": {
    "currentGoal": "Add WebSocket support",
    "inProgress": ["WebSocket handler"],
    "blockers": ["WS drops after 30s idle"],
    "recentlyCompleted": ["Error handling", "Zod validation"]
  },

  // KEY FILES -- important file map
  "keyFiles": [
    { "path": "src/index.ts", "role": "Main server entry" }
  ],

  // KNOWN ISSUES -- bugs and workarounds
  "knownIssues": [
    { "issue": "pg ESM import fails", "workaround": "use createRequire", "severity": "low" }
  ],

  // PREFERENCES -- how the user prefers to work
  "preferences": {
    "style": "Learning by doing",
    "constraints": ["$0 cost only"],
    "communication": "Explain reasoning, not just code"
  },

  // NEXT STEPS -- ordered priority queue
  "nextSteps": ["Fix WS timeout", "Add rate limiting"]
}
```

---

## Merge Strategy

`llm-brain` does not blindly overwrite. It intelligently merges each new session with the existing state:

| Field | Strategy |
|-------|----------|
| `facts.stack` | Union (always grows, never shrinks) |
| `facts.architecture` | Replace (latest wins) |
| `decisions` | Upsert by `what` field (update or add) |
| `activeState.currentGoal` | Replace (latest wins) |
| `activeState.recentlyCompleted` | Sliding window of last 10 |
| `keyFiles` | Upsert by `path` |
| `knownIssues` | Upsert by `issue` text |
| `nextSteps` | Replace (always latest) |

---

## Configuration

Edit `.llm-brain/config.json` to customize behavior:

```jsonc
{
  "saveSource": "clipboard",       // "clipboard" | "stdin" | "file"
  "loadTarget": "clipboard",       // "clipboard" | "stdout"
  "maxHistory": 50,                // max session snapshots to keep
  "gitIgnore": false,              // false = commit brain state (recommended)
  "autoDetectProject": true        // auto-detect name from package.json or git
}
```

---

## Usage Notes

- **Commit your `.llm-brain/` directory.** It contains only JSON and markdown. Version-controlling it alongside your code is recommended.
- **Works with any LLM.** Compatible with ChatGPT, Claude, Gemini, GitHub Copilot, Cursor, and any tool that accepts text input.
- **The extraction prompt is critical.** Run `llm-brain template show extract` and paste it at the end of every session before closing.
- **Sessions are cumulative.** Each `save` builds on the previous state. The brain becomes more complete over time.

---

## Technology

| Component | Technology |
|-----------|------------|
| Language | TypeScript |
| Build | tsup |
| CLI Framework | Commander.js |
| Clipboard | clipboardy |
| Validation | Zod |
| Output Formatting | chalk |

---

## License

MIT
