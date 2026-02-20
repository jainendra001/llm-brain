import { Command } from "commander";
import { logger } from "../utils/logger.js";
import { getHistoryDir, listFiles } from "../utils/fs.js";
import { readFile } from "fs/promises";
import { join } from "path";

export function historyCommand(program: Command) {
  program
    .command("history")
    .description("List all sessions")
    .option("--limit <n>", "Show last N sessions", "10")
    .action(async (options) => {
      try {
        const cwd = process.cwd();
        const historyDir = getHistoryDir(cwd);
        const files = (await listFiles(historyDir)).sort();

        if (files.length === 0) {
          logger.info("No history found. Run llm-brain save to create a session.");
          return;
        }

        const limit = parseInt(options.limit, 10);
        const limited = files.slice(-limit);

        logger.brain(`Showing last ${limited.length} session(s) of ${files.length} total`);
        console.log();

        for (const file of limited) {
          try {
            const content = await readFile(join(historyDir, file), "utf-8");
            const record = JSON.parse(content);
            const date = new Date(record.timestamp).toLocaleString();
            const goal = record.brainSnapshot?.activeState?.currentGoal || "—";
            console.log(
              `  #${String(record.session).padStart(3, "0")}  ${date}  │  ${goal}`,
            );
          } catch {
            console.log(`  ${file} (unreadable)`);
          }
        }
      } catch (error) {
        if (error instanceof Error) {
          logger.error(`History failed: ${error.message}`);
        } else {
          logger.error(`History failed: ${String(error)}`);
        }
        process.exit(1);
      }
    });
}
