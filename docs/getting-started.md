# Getting Started with llm-brain

## Prerequisites

- Node.js >= 18.0.0

## Installation

Install globally to register the `llm-brain` command on your PATH:

```bash
npm install -g llm-brain
```

> **Note:** The `-g` flag is required. Without it, the CLI command will not be available in your terminal. Alternatively, you can use `npx llm-brain` without a global install.

## Your First Session

### Step 1: Initialize in a project

```bash
cd your-project
llm-brain init
```

### Step 2: Get the extraction prompt

```bash
llm-brain template show extract
```

Copy this prompt. You will paste it at the **end** of every LLM conversation.

### Step 3: Run a conversation with your LLM

Work on your project as normal. At the **end**, paste the extraction prompt you copied and ask the LLM to fill it out. It will generate a JSON block summarizing the session.

### Step 4: Save the state

Copy the JSON block to your clipboard, then run:

```bash
llm-brain save
```

### Step 5: Resume in a new conversation

```bash
llm-brain load
```

This copies a ready-to-paste context block to your clipboard. Paste it at the **start** of your next conversation. The LLM instantly has your project context, decisions, blockers, and next steps.

---

## Daily Workflow

Once set up, the workflow is two commands per session:

```
End of chat  ->  paste extract prompt  ->  copy JSON  ->  llm-brain save
New chat     ->  llm-brain load        ->  paste       ->  done
```

---

## Saving from Different Sources

```bash
# From clipboard (default)
llm-brain save

# From piped stdin
echo '{"facts": ...}' | llm-brain save --from stdin

# From a file
llm-brain save --from file --file ./my-state.json
```

## Useful Commands

```bash
llm-brain show                      # View the current brain state
llm-brain show --section decisions  # View only decisions
llm-brain history                   # List all past sessions
llm-brain load --session 3          # Load from a specific session
```
