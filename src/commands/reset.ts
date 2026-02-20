import { Command } from "commander";
import { createInitialBrain } from "../core/brain.js";
import { getBrainDir, getBrainJsonPath, getHistoryDir, exists } from "../utils/fs.js";
import { logger } from "../utils/logger.js";
import { rm } from "fs/promises";

export function resetCommand(program: Command) {
  program
    .command("reset")
    .description("Reset brain state")
    .option("--keep-config", "Keep config, reset state only")
    .option("--yes", "Skip confirmation prompt")
    .action(async (options) => {
      try {
        const cwd = process.cwd();
        const brainDir = getBrainDir(cwd);

        if (!exists(brainDir)) {
          logger.error("No .llm-brain/ found. Run llm-brain init first.");
          process.exit(1);
        }

        if (!options.yes) {
          // Simple confirmation via stdin
          const readline = await import("readline");
          const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
          });

          const confirmed = await new Promise<boolean>((resolve) => {
            rl.question(
              "⚠️  This will reset your brain state. Are you sure? (y/N) ",
              (answer) => {
                rl.close();
                resolve(answer.toLowerCase() === "y");
              },
            );
          });

          if (!confirmed) {
            logger.info("Reset cancelled.");
            return;
          }
        }

        if (options.keepConfig) {
          // Only reset brain.json and history
          const brainJsonPath = getBrainJsonPath(cwd);
          const historyDir = getHistoryDir(cwd);

          if (exists(brainJsonPath)) {
            await rm(brainJsonPath);
          }
          if (exists(historyDir)) {
            await rm(historyDir, { recursive: true });
          }

          // Recreate a fresh brain (keeps config)
          await createInitialBrain(cwd);
          logger.success("Brain state reset (config preserved).");
        } else {
          // Full reset — remove entire .llm-brain/
          await rm(brainDir, { recursive: true });
          logger.success("Brain state fully reset. Run llm-brain init to start fresh.");
        }
      } catch (error) {
        if (error instanceof Error) {
          logger.error(`Reset failed: ${error.message}`);
        } else {
          logger.error(`Reset failed: ${String(error)}`);
        }
        process.exit(1);
      }
    });
}
