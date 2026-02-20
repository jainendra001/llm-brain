import { Command } from "commander";
import { createInitialBrain } from "../core/brain.js";
import { getBrainJsonPath, getConfigPath, getHistoryDir, getTemplatesDir, exists, ensureDir } from "../utils/fs.js";
import { logger } from "../utils/logger.js";
import { appendFile, writeFile, readFile } from "fs/promises";

export function initCommand(program: Command) {
  program
    .command("init")
    .description("Initialize .llm-brain/ in current project")
    .action(async () => {
      const cwd = process.cwd();

      if (exists(getBrainJsonPath(cwd))) {
        logger.error(".llm-brain/ is already initialized in this project.");
        logger.info("Run 'llm-brain reset' to start fresh.");
        process.exit(1);
      }

      try {
        logger.brain("Initializing llm-brain...");
        console.log();

        const brain = await createInitialBrain(cwd);

        logger.success(`Detected project: ${brain.project}`);
        logger.success(`Created ${getBrainJsonPath(cwd)}`);
        logger.success(`Created ${getConfigPath(cwd)}`);

        ensureDir(getHistoryDir(cwd));
        logger.success(`Created ${getHistoryDir(cwd)}/`);

        ensureDir(getTemplatesDir(cwd));
        logger.success(`Created ${getTemplatesDir(cwd)}/`);

        // Add .llm-brain/ to .gitignore (optional, non-fatal)
        try {
          const gitignorePath = `${cwd}/.gitignore`;
          if (!exists(gitignorePath)) {
            await writeFile(gitignorePath, "# llm-brain\n.llm-brain/\n", "utf-8");
          } else {
            const content = await readFile(gitignorePath, "utf-8");
            if (!content.includes(".llm-brain/")) {
              await appendFile(gitignorePath, "\n# llm-brain\n.llm-brain/\n", "utf-8");
            }
          }
          logger.success("Added .llm-brain/ to .gitignore");
        } catch {
          logger.warning("Could not update .gitignore");
        }

        console.log();
        logger.brain("🚀 Ready! Here's how to use it:\n");
        console.log("  1. At the end of your LLM conversation, ask:");
        console.log('     "Generate my brain state — llm-brain template show extract"');
        console.log();
        console.log("  2. Copy the JSON output, then run:");
        console.log("     $ llm-brain save");
        console.log();
        console.log("  3. Starting a new conversation? Run:");
        console.log("     $ llm-brain load");
        console.log("     Then paste into your new chat.");
        console.log();
        console.log('  💡 Run "llm-brain template show extract" to see the extraction prompt.');
      } catch (error) {
        logger.error(`Initialization failed: ${error}`);
        process.exit(1);
      }
    });
}
