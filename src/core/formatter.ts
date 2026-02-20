import type { BrainState } from "../types/brain.js";

export function formatBrainForInjection(brain: BrainState): string {
  return `# Context Restoration

You are resuming a conversation with me. Below is my project's brain state — a structured summary of everything we've discussed in previous sessions. Use this as your working memory.

## Brain State
\`\`\`json
${JSON.stringify(brain, null, 2)}
\`\`\`

## Instructions
- You now have full context of this project
- Refer to the decisions and respect the reasoning
- Continue from the "currentGoal" in activeState
- The "nextSteps" list is your priority queue
- If there are blockers, address them first
- Maintain my preferences throughout our conversation
- Do NOT ask me to re-explain anything covered in the brain state

Let's continue from where we left off.`;
}

export function formatBrainForDisplay(brain: BrainState): string {
  const lines: string[] = [];

  lines.push(
    `🧠 Brain State: ${brain.project} (Session #${brain.sessionCount})`,
  );
  lines.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  // Current Goal
  if (brain.activeState.currentGoal) {
    lines.push("");
    lines.push("🎯 Current Goal");
    lines.push(`   ${brain.activeState.currentGoal}`);
  }

  // Stack
  if (brain.facts.stack.length > 0) {
    lines.push("");
    lines.push("📦 Stack");
    lines.push(`   ${brain.facts.stack.join(", ")}`);
  }

  // Architecture
  if (brain.facts.architecture) {
    lines.push("");
    lines.push("🏗️ Architecture");
    lines.push(`   ${brain.facts.architecture}`);
  }

  // Decisions
  if (brain.decisions.length > 0) {
    lines.push("");
    lines.push(`🗺️ Key Decisions (${brain.decisions.length})`);
    for (const d of brain.decisions) {
      lines.push(`   • ${d.what}`);
      lines.push(`     ${d.why}`);
    }
  }

  // In Progress
  if (brain.activeState.inProgress.length > 0) {
    lines.push("");
    lines.push("🚧 In Progress");
    for (const item of brain.activeState.inProgress) {
      lines.push(`   • ${item}`);
    }
  }

  // Blockers
  if (brain.activeState.blockers.length > 0) {
    lines.push("");
    lines.push("⚠️ Blockers");
    for (const blocker of brain.activeState.blockers) {
      lines.push(`   • ${blocker}`);
    }
  }

  // Recently Completed
  if (brain.activeState.recentlyCompleted.length > 0) {
    lines.push("");
    lines.push("✅ Recently Completed");
    for (const item of brain.activeState.recentlyCompleted) {
      lines.push(`   • ${item}`);
    }
  }

  // Next Steps
  if (brain.nextSteps.length > 0) {
    lines.push("");
    lines.push("📝 Next Steps");
    brain.nextSteps.forEach((step: string, i: number) => {
      lines.push(`   ${i + 1}. ${step}`);
    });
  }

  // Key Files
  if (brain.keyFiles.length > 0) {
    lines.push("");
    lines.push(`📁 Key Files (${brain.keyFiles.length})`);
    for (const kf of brain.keyFiles) {
      lines.push(`   • ${kf.path} — ${kf.role}`);
    }
  }

  // Known Issues
  if (brain.knownIssues.length > 0) {
    lines.push("");
    lines.push("🐛 Known Issues");
    for (const issue of brain.knownIssues) {
      lines.push(`   [${issue.severity.toUpperCase()}] ${issue.issue}`);
      lines.push(`   Workaround: ${issue.workaround}`);
    }
  }

  // Preferences
  if (brain.preferences.style || brain.preferences.constraints.length > 0) {
    lines.push("");
    lines.push("👤 Preferences");
    if (brain.preferences.style) {
      lines.push(`   Style: ${brain.preferences.style}`);
    }
    if (brain.preferences.constraints.length > 0) {
      lines.push(`   Constraints: ${brain.preferences.constraints.join(", ")}`);
    }
    if (brain.preferences.communication) {
      lines.push(`   Communication: ${brain.preferences.communication}`);
    }
  }

  return lines.join("\n");
}

export function formatCompact(brain: BrainState): string {
  const parts: string[] = [];

  parts.push(`Session #${brain.sessionCount}`);
  parts.push(`Goal: ${brain.activeState.currentGoal || "None"}`);

  if (brain.activeState.blockers.length > 0) {
    parts.push(`${brain.activeState.blockers.length} blockers`);
  }

  if (brain.decisions.length > 0) {
    parts.push(`${brain.decisions.length} decisions`);
  }

  return parts.join(" | ");
}

export function formatSection(brain: BrainState, section: string): string {
  switch (section) {
    case "facts":
      return JSON.stringify(brain.facts, null, 2);
    case "decisions":
      return JSON.stringify(brain.decisions, null, 2);
    case "activeState":
      return JSON.stringify(brain.activeState, null, 2);
    case "keyFiles":
      return JSON.stringify(brain.keyFiles, null, 2);
    case "knownIssues":
      return JSON.stringify(brain.knownIssues, null, 2);
    case "preferences":
      return JSON.stringify(brain.preferences, null, 2);
    case "nextSteps":
      return JSON.stringify(brain.nextSteps, null, 2);
    default:
      return `Unknown section: ${section}. Available: facts, decisions, activeState, keyFiles, knownIssues, preferences, nextSteps`;
  }
}
