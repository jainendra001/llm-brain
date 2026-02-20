# Getting Started with llm-brain

## Installation

```bash
npm install -g llm-brain
```

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
Copy this prompt. You'll paste it at the **end** of every LLM conversation.

### Step 3: Run a conversation with your LLM

Work on your project as normal. At the **end**, paste the extraction prompt you copied and ask
the LLM to fill it out. It will generate a JSON block summarizing the session.

### Step 4: Save the state
Copy the JSON block to your clipboard, then:
```bash
llm-brain save
```

### Step 5: Resume in a new conversation
```bash
llm-brain load
```
This copies a ready-to-paste context block to your clipboard. Paste it at the **start** of
your next conversation. The LLM instantly knows your project, decisions, blockers, and next steps.

---

## Daily Workflow (Once Set Up)

```
End of chat  →  paste extract prompt  →  copy JSON  →  llm-brain save
New chat     →  llm-brain load        →  paste       →  done ✓
```

That's it. Two commands per session.

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

## Useful Commands at a Glance

```bash
llm-brain show                     # See what's in your brain
llm-brain show --section decisions # See only decisions
llm-brain history                  # List all past sessions
llm-brain load --session 3         # Load from session #3
```
