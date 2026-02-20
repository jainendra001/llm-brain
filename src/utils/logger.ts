import chalk from "chalk";

export const logger = {
  info: (msg: string) => console.log(chalk.blue("ℹ"), msg),
  success: (msg: string) => console.log(chalk.green("✓"), msg),
  error: (msg: string) => console.error(chalk.red("✗"), msg),
  warning: (msg: string) => console.log(chalk.yellow("⚠"), msg),
  brain: (msg: string) => console.log(chalk.cyan("🧠"), msg),
  section: (title: string) => {
    console.log();
    console.log(chalk.bold.white(title));
    console.log(chalk.gray("━".repeat(50)));
  },
  json: (obj: unknown) => console.log(JSON.stringify(obj, null, 2)),
  newline: () => console.log(),
};
