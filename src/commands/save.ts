import { Command } from "commander";
import { saveBrain, loadBrain, loadConfig } from "../core/brain.js";
import { logger } from "../utils/logger.js";
import { clipboard } from "../core/clipboard.js";
import { validateBrainState } from "../core/validator.js";
import { readFile } from "fs/promises";

export function saveCommand(program: Command) {
  program
    .command("save")
    .description("Save/merge state with new brain state")
    .option(
      "--from <source>",
      "Source of brain state (clipboard, stdin, file)",
      "clipboard",
    )
    .option("--file <path>", "Path to brain state file (if --from file)")
    .option("--replace", "Replace instead of merge with existing state")
    .action(async (options) => {
      try {
        const cwd = process.cwd();
        const config = await loadConfig(cwd);
        const source = options.from || config.saveSource;
        let newState: unknown;

        // Read from specified source
        if (source === "clipboard") {
          const clipboardContent = await clipboard.read();
          try {
            newState = JSON.parse(clipboardContent);
          } catch (e) {
            throw new Error("Clipboard content is not valid JSON");
          }
        } else if (source === "stdin") {
          const stdinContent = await new Promise<string>((resolve) => {
            let input = "";
            process.stdin.on("data", (chunk) => (input += chunk));
            process.stdin.on("end", () => resolve(input));
          });
          try {
            newState = JSON.parse(stdinContent);
          } catch (e) {
            throw new Error("Stdin content is not valid JSON");
          }
        } else if (source === "file") {
          if (!options.file) {
            throw new Error("--file option is required when --from file");
          }
          const fileContent = await readFile(options.file, "utf-8");
          try {
            newState = JSON.parse(fileContent);
          } catch (e) {
            throw new Error(`File ${options.file} does not contain valid JSON`);
          }
        } else {
          throw new Error(`Invalid source: ${source}`);
        }

        // Validate new state
        const validationResult = validateBrainState(newState);
        if (!validationResult.success) {
          throw new Error(
            `Invalid brain state: ${validationResult.errors?.join(", ")}`,
          );
        }

        // Save/merge the state
        const { merged, diff } = await saveBrain(
          cwd,
          newState,
          options.replace,
        );

        // Display summary
        logger.success("Brain state updated successfully!");
        logger.brain(`Session #${merged.sessionCount} saved`);

        // Show diff summary
        if (diff.added) {
          const addedCount = Object.keys(diff.added).length;
          logger.info(`+ ${addedCount} new item${addedCount !== 1 ? "s" : ""}`);
        }
        if (diff.modified) {
          const modifiedCount = Object.keys(diff.modified).length;
          logger.info(
            `~ ${modifiedCount} change${modifiedCount !== 1 ? "s" : ""}`,
          );
        }

        logger.info(`Total brain size: ${JSON.stringify(merged).length} bytes`);
      } catch (error) {
        if (error instanceof Error) {
          logger.error(`Save failed: ${error.message}`);
        } else {
          logger.error(`Save failed: ${String(error)}`);
        }
        process.exit(1);
      }
    });
}
