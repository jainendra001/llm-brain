import { execSync } from "child_process";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

export function isGitRepo(cwd: string): boolean {
  try {
    execSync("git rev-parse --git-dir", { cwd, stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

export function getGitRoot(cwd: string): string | null {
  try {
    const root = execSync("git rev-parse --show-toplevel", {
      cwd,
      stdio: "pipe",
      encoding: "utf-8",
    }).trim();
    return root;
  } catch {
    return null;
  }
}

export function getProjectName(cwd: string): string | null {
  // Try package.json name first
  const packageJsonPath = join(cwd, "package.json");
  if (existsSync(packageJsonPath)) {
    try {
      const pkg = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
      if (pkg.name) return pkg.name;
    } catch {
      // ignore
    }
  }

  // Try git repo name
  const gitRoot = getGitRoot(cwd);
  if (gitRoot) {
    const parts = gitRoot.split("/");
    return parts[parts.length - 1] || null;
  }

  return null;
}

export function addToGitignore(cwd: string, entry: string): boolean {
  const gitignorePath = join(cwd, ".gitignore");
  try {
    let content = "";
    if (existsSync(gitignorePath)) {
      content = readFileSync(gitignorePath, "utf-8");
      if (content.includes(entry)) return true;
    }

    const newContent =
      content + (content.endsWith("\n") ? "" : "\n") + entry + "\n";
    writeFileSync(gitignorePath, newContent);
    return true;
  } catch {
    return false;
  }
}
