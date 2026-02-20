# Generate Brain State

Please generate a JSON object representing the current state of our conversation.
Follow this exact schema. Only include fields that are relevant.

```json
{
  "facts": {
    "stack": ["list of technologies used"],
    "architecture": "brief architecture description",
    "environment": { "key": "value pairs for OS, editor, etc." },
    "custom": ["any other important facts about the project"]
  },
  "decisions": [
    {
      "what": "what was decided",
      "why": "reasoning behind the decision",
      "when": "YYYY-MM-DD",
      "reversible": true
    }
  ],
  "activeState": {
    "currentGoal": "what we're currently working on",
    "inProgress": ["tasks currently being worked on"],
    "blockers": ["things blocking progress"],
    "recentlyCompleted": ["tasks completed in this session"]
  },
  "keyFiles": [{ "path": "relative/path", "role": "what this file does" }],
  "knownIssues": [
    {
      "issue": "description of the issue",
      "workaround": "how we're handling it",
      "severity": "low|medium|high|critical"
    }
  ],
  "preferences": {
    "style": "how the user prefers to work",
    "constraints": ["any constraints like budget, time"],
    "communication": "how the user likes explanations"
  },
  "nextSteps": ["next task to do", "task after that"]
}
```

Rules:

- Output ONLY the JSON block, no explanation
- Only include fields that have actual content
- Be concise — each value should be as short as possible while preserving meaning
- Decisions should capture the WHY, not just the WHAT
- nextSteps should be ordered by priority
