import { Command } from "commander";
import { loadBrain, loadConfig } from "../core/brain.js";
import { formatBrainForInjection } from "../core/formatter.js";
import { clipboard } from "../core/clipboard.js";
import { logger } from "../utils/logger.js";
import { getHistoryDir } from "../utils/fs.js";
import { readFile } from "fs/promises";
import { join } from "path";

export function loadCommand(program: Command) {
  program
    .command("load")
    .description("Load brain state for a new conversation")
    .option("--to <target>", "Output target (clipboard, stdout)", "clipboard")
    .option("--session <n>", "Load from a specific session number")
    .action(async (options) => {
      try {
        const cwd = process.cwd();
        let brain;

        if (options.session) {
          // Load from specific session history
          const historyDir = getHistoryDir(cwd);
          const sessionNum = parseInt(options.session, 10);
          const paddedNum = sessionNum.toString().padStart(3, "0");

          // Find matching history file
          const { listFiles } = await import("../utils/fs.js");
          const files = await listFiles(historyDir);
          const match = files.find((f) => f.startsWith(`s${paddedNum}_`));

          if (!match) {
            throw new Error(`Session #${sessionNum} not found`);
          }

          const sessionPath = join(historyDir, match);
          const sessionContent = await readFile(sessionPath, "utf-8");
          const sessionRecord = JSON.parse(sessionContent);
          brain = sessionRecord.brainSnapshot;
        } else {
          brain = await loadBrain(cwd);
        }

        const config = await loadConfig(cwd);
        const formatted = formatBrainForInjection(brain);
        const target = options.to || config.loadTarget;

        if (target === "clipboard") {
          await clipboard.write(formatted);
          const tokenEstimate = Math.ceil(formatted.length / 4);
          logger.success(
            `Brain state copied to clipboard (≈${tokenEstimate} tokens)`,
          );
          logger.brain(
            `Project: ${brain.project} | Session #${brain.sessionCount}`,
          );
          logger.info("📋 Paste this at the start of your new conversation.");
        } else if (target === "stdout") {
          console.log(formatted);
        } else {
          throw new Error(`Invalid target: ${target}`);
        }
      } catch (error) {
        if (error instanceof Error) {
          logger.error(`Load failed: ${error.message}`);
        } else {
          logger.error(`Load failed: ${String(error)}`);
        }
        process.exit(1);
      }
    });
}
