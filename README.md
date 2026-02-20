# 🧠 llm-brain

> **"package.json for your thinking"** — A portable memory layer for LLM conversations.

Every time you start a new LLM chat, all context is lost. `llm-brain` fixes that. It gives your LLM a persistent "brain" — a structured JSON file that accumulates decisions, progress, goals, and facts across sessions.

---

## ✨ How It Works

At the **end** of a conversation, you ask your LLM to generate a brain state snapshot. `llm-brain save` merges it into a growing brain file. At the **start** of any new conversation, `llm-brain load` copies the full context to your clipboard — paste it in and the LLM instantly knows everything.

```
End of chat  →  Ask LLM to generate brain state  →  llm-brain save
New chat     →  llm-brain load  →  Paste  →  LLM remembers everything
```

---

## 📦 Installation

```bash
npm install -g llm-brain
```

Or use it locally in a project:

```bash
npm install --save-dev llm-brain
```

---

## 🚀 Quick Start

### 1. Initialize in your project

```bash
cd my-project
llm-brain init
```

This creates a `.llm-brain/` folder with:
```
.llm-brain/
├── brain.json         ← The persistent state file
├── config.json        ← Your preferences
├── history/           ← Snapshot of each session
└── templates/         ← Prompt templates
```

### 2. Get the extraction prompt

```bash
llm-brain template show extract
```

Copy this prompt. At the **end** of any LLM conversation, paste it in and ask the LLM to generate your brain state JSON.

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

Your full context is now on your clipboard. Paste it at the start of your new chat — the LLM will have complete context and continue right where you left off.

---

## 📋 Commands

### `llm-brain init`
Initialize `.llm-brain/` in the current project directory.

```bash
llm-brain init
```

---

### `llm-brain save`
Save and merge a new brain state.

```bash
llm-brain save                      # Read from clipboard (default)
llm-brain save --from stdin         # Read from piped stdin
llm-brain save --from file --file ./state.json  # Read from a file
llm-brain save --replace            # Replace instead of merging
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
Manage the prompt templates.

```bash
llm-brain template show extract     # Show the extraction prompt
llm-brain template show inject      # Show the injection prompt
llm-brain template reset            # Reset templates to defaults
```

---

## 🗂️ The Brain State (What Gets Saved)

The `brain.json` file is a structured JSON document with 7 layers:

```jsonc
{
  "version": "1.0.0",
  "project": "my-project",
  "sessionCount": 7,

  // FACTS — project truths that accumulate over time
  "facts": {
    "stack": ["TypeScript", "Express", "PostgreSQL"],
    "architecture": "Monolith",
    "environment": { "os": "macOS", "node": "20.x" },
    "custom": ["API on port 3000", "ESM modules"]
  },

  // DECISIONS — what was decided and WHY
  "decisions": [
    { "what": "Use PostgreSQL", "why": "Relational data fits", "when": "2026-02-15", "reversible": true }
  ],

  // ACTIVE STATE — what's happening right now
  "activeState": {
    "currentGoal": "Add WebSocket support",
    "inProgress": ["WebSocket handler"],
    "blockers": ["WS drops after 30s idle"],
    "recentlyCompleted": ["Error handling", "Zod validation"]
  },

  // KEY FILES — important file map
  "keyFiles": [
    { "path": "src/index.ts", "role": "Main server entry" }
  ],

  // KNOWN ISSUES — bugs and workarounds
  "knownIssues": [
    { "issue": "pg ESM import fails", "workaround": "use createRequire", "severity": "low" }
  ],

  // PREFERENCES — how the user likes to work
  "preferences": {
    "style": "Learning by doing",
    "constraints": ["$0 cost only"],
    "communication": "Explain reasoning, not just code"
  },

  // NEXT STEPS — ordered priority queue
  "nextSteps": ["Fix WS timeout", "Add rate limiting"]
}
```

---

## 🔀 Merge Strategy

`llm-brain` doesn't blindly overwrite — it **intelligently merges** each new session with the existing state:

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

## ⚙️ Configuration

Edit `.llm-brain/config.json` to customize behavior:

```jsonc
{
  "saveSource": "clipboard",    // "clipboard" | "stdin" | "file"
  "loadTarget": "clipboard",    // "clipboard" | "stdout"
  "maxHistory": 50,             // max session snapshots to keep
  "gitIgnore": false,           // false = commit brain state (recommended)
  "autoDetectProject": true     // auto-detect name from package.json / git
}
```

---

## 💡 Tips

- **Commit your `.llm-brain/`** — it's just JSON and markdown. Version-control your brain alongside your code.
- **Use with any LLM** — works with ChatGPT, Claude, Gemini, GitHub Copilot, Cursor, or any tool that accepts text.
- **The extraction prompt matters** — run `llm-brain template show extract` and paste it at the end of every session before closing.
- **Sessions are cumulative** — each `save` builds on the previous one. The brain gets smarter over time.

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| Language | TypeScript |
| Build | tsup |
| CLI framework | Commander.js |
| Clipboard | clipboardy |
| Validation | Zod |
| Colors | chalk |

---

## 📄 License

MIT
