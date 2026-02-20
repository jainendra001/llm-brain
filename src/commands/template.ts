import { Command } from "commander";
import { logger } from "../utils/logger.js";
import {
  getTemplatesDir,
  exists,
  ensureDir,
  readFile,
  writeFile,
} from "../utils/fs.js";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { readFile as fsReadFile } from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function getDefaultTemplate(name: "extract" | "inject"): Promise<string> {
  // Try to find bundled templates relative to the compiled output
  const candidates = [
    join(__dirname, "..", "templates", `${name}.md`),
    join(__dirname, "templates", `${name}.md`),
  ];

  for (const candidate of candidates) {
    if (exists(candidate)) {
      return fsReadFile(candidate, "utf-8");
    }
  }

  // Hardcoded fallback
  if (name === "extract") {
    return `# Generate Brain State

Please generate a JSON object representing the current state of our conversation.

\`\`\`json
{
  "facts": { "stack": [], "architecture": "", "environment": {}, "custom": [] },
  "decisions": [{ "what": "", "why": "", "when": "YYYY-MM-DD", "reversible": true }],
  "activeState": { "currentGoal": "", "inProgress": [], "blockers": [], "recentlyCompleted": [] },
  "keyFiles": [{ "path": "", "role": "" }],
  "knownIssues": [{ "issue": "", "workaround": "", "severity": "low" }],
  "preferences": { "style": "", "constraints": [], "communication": "" },
  "nextSteps": []
}
\`\`\`

Rules:
- Output ONLY the JSON block, no explanation
- Only include fields that have actual content
- Be concise
`;
  } else {
    return `# Context Restoration

You are resuming a conversation with me. Below is my project's brain state.

## Brain State
\`\`\`json
{{BRAIN_STATE_JSON}}
\`\`\`

## Instructions
- You now have full context of this project
- Continue from the "currentGoal" in activeState
- The "nextSteps" list is your priority queue
- Do NOT ask me to re-explain anything covered in the brain state

Let's continue from where we left off.
`;
  }
}

export function templateCommand(program: Command) {
  const tmpl = program
    .command("template")
    .description("Manage prompt templates");

  tmpl
    .command("show <name>")
    .description("Show a template (extract or inject)")
    .action(async (name: string) => {
      try {
        const cwd = process.cwd();

        if (name !== "extract" && name !== "inject") {
          logger.error("Template name must be 'extract' or 'inject'");
          process.exit(1);
        }

        const templatesDir = getTemplatesDir(cwd);
        const templatePath = join(templatesDir, `${name}.md`);

        if (exists(templatePath)) {
          console.log(await readFile(templatePath));
        } else {
          logger.info(`No custom ${name} template found. Showing default:`);
          console.log();
          console.log(await getDefaultTemplate(name));
        }
      } catch (error) {
        if (error instanceof Error) {
          logger.error(error.message);
        }
        process.exit(1);
      }
    });

  tmpl
    .command("reset")
    .description("Reset templates to defaults")
    .action(async () => {
      try {
        const cwd = process.cwd();
        const templatesDir = getTemplatesDir(cwd);
        ensureDir(templatesDir);

        for (const name of ["extract", "inject"] as const) {
          const content = await getDefaultTemplate(name);
          await writeFile(join(templatesDir, `${name}.md`), content);
        }

        logger.success("Templates reset to defaults.");
      } catch (error) {
        if (error instanceof Error) {
          logger.error(`Reset failed: ${error.message}`);
        }
        process.exit(1);
      }
    });
}
