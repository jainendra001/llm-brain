import { promises as fs, existsSync, mkdirSync } from "fs";
import { dirname, join } from "path";

export async function readFile(path: string): Promise<string> {
  return fs.readFile(path, "utf-8");
}

export async function writeFile(path: string, content: string): Promise<void> {
  ensureDir(dirname(path));
  return fs.writeFile(path, content, "utf-8");
}

export async function readJson<T>(path: string): Promise<T> {
  const content = await readFile(path);
  return JSON.parse(content) as T;
}

export async function writeJson(path: string, data: unknown): Promise<void> {
  await writeFile(path, JSON.stringify(data, null, 2));
}

export function exists(path: string): boolean {
  return existsSync(path);
}

export function ensureDir(path: string): void {
  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true });
  }
}

export async function listFiles(dir: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return entries
      .filter((e: { isFile: () => boolean }) => e.isFile())
      .map((e: { name: string }) => e.name);
  } catch {
    return [];
  }
}

export function getBrainDir(cwd: string): string {
  return join(cwd, ".llm-brain");
}

export function getBrainJsonPath(cwd: string): string {
  return join(getBrainDir(cwd), "brain.json");
}

export function getConfigPath(cwd: string): string {
  return join(getBrainDir(cwd), "config.json");
}

export function getHistoryDir(cwd: string): string {
  return join(getBrainDir(cwd), "history");
}

export function getTemplatesDir(cwd: string): string {
  return join(getBrainDir(cwd), "templates");
}
