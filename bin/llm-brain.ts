#!/usr/bin/env node
import { program } from "commander";
import { initCommand } from "../src/commands/init.js";
import { saveCommand } from "../src/commands/save.js";
import { loadCommand } from "../src/commands/load.js";
import { showCommand } from "../src/commands/show.js";
import { historyCommand } from "../src/commands/history.js";
import { resetCommand } from "../src/commands/reset.js";
import { templateCommand } from "../src/commands/template.js";

program
  .name("llm-brain")
  .description("A portable memory layer for LLM conversations")
  .version("1.0.2");

// Add all commands
initCommand(program);
saveCommand(program);
loadCommand(program);
showCommand(program);
historyCommand(program);
resetCommand(program);
templateCommand(program);

program.parse(process.argv);
