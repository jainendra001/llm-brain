import { Command } from "commander";
import { loadBrain } from "../core/brain.js";
import {
  formatBrainForDisplay,
  formatCompact,
  formatSection,
} from "../core/formatter.js";
import { logger } from "../utils/logger.js";

export function showCommand(program: Command) {
  program
    .command("show")
    .description("Display current brain state")
    .option("--json", "Raw JSON output")
    .option("--section <name>", "Show specific section only")
    .option("--compact", "One-line summary")
    .action(async (options) => {
      try {
        const cwd = process.cwd();
        const brain = await loadBrain(cwd);

        if (options.json) {
          logger.json(brain);
        } else if (options.compact) {
          console.log(formatCompact(brain));
        } else if (options.section) {
          const sectionOutput = formatSection(brain, options.section);
          console.log(sectionOutput);
        } else {
          console.log(formatBrainForDisplay(brain));
        }
      } catch (error) {
        if (error instanceof Error) {
          logger.error(`Show failed: ${error.message}`);
        } else {
          logger.error(`Show failed: ${String(error)}`);
        }
        process.exit(1);
      }
    });
}
