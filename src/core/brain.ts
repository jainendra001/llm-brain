import type { BrainState, BrainConfig, IncomingBrainState } from "../types/brain.js";
import {
  exists,
  ensureDir,
  getBrainDir,
  getBrainJsonPath,
  getConfigPath,
  getHistoryDir,
  readFile,
  writeFile,
} from "../utils/fs.js";
import { getProjectName } from "../utils/git.js";
import { validateBrainState, validateBrainConfig } from "./validator.js";
import { mergeBrainState } from "./merger.js";
import { createEmptyBrainState, createDefaultConfig } from "../types/brain.js";
import { logger } from "../utils/logger.js";

export async function loadBrain(cwd: string): Promise<BrainState> {
  const brainPath = getBrainJsonPath(cwd);

  if (!exists(brainPath)) {
    const config = await loadConfig(cwd);
    const projectName = config.autoDetectProject
      ? getProjectName(cwd) || "unnamed-project"
      : "unnamed-project";

    return createEmptyBrainState(projectName);
  }

  try {
    const state = await readBrainState(brainPath);
    if (validateBrainState(state).success) {
      return state;
    } else {
      throw new Error("Invalid brain state format");
    }
  } catch (error) {
    logger.error(`Failed to load brain state: ${error}`);
    throw error;
  }
}

export async function loadConfig(cwd: string): Promise<BrainConfig> {
  const configPath = getConfigPath(cwd);

  if (!exists(configPath)) {
    return createDefaultConfig();
  }

  try {
    const config = await readBrainConfig(configPath);
    if (validateBrainConfig(config).success) {
      return config;
    } else {
      logger.warning("Invalid config detected, using default config");
      return createDefaultConfig();
    }
  } catch (error) {
    logger.warning("Config file error, using default config");
    return createDefaultConfig();
  }
}

export async function saveBrain(
  cwd: string,
  incomingContent: IncomingBrainState,
  replace = false,
): Promise<{ merged: BrainState; diff: any }> {
  const brainPath = getBrainJsonPath(cwd);
  ensureDir(getBrainDir(cwd));
  ensureDir(getHistoryDir(cwd));

  const existingState = replace
    ? createEmptyBrainState(
      getProjectName(cwd) || "unnamed-project",
    )
    : await loadBrain(cwd);

  // Build a full BrainState by combining existing metadata with incoming content
  const incomingState: BrainState = {
    version: existingState.version,
    project: existingState.project,
    lastUpdated: new Date().toISOString(),
    sessionCount: existingState.sessionCount,
    ...incomingContent,
  };

  // Apply merge algorithm
  const { merged, diff } = mergeBrainState(existingState, incomingState);

  // Save merged state
  await writeBrainState(brainPath, merged);

  // Save history snapshot
  await saveHistorySnapshot(cwd, merged, diff);

  return { merged, diff };
}

export async function createInitialBrain(cwd: string): Promise<BrainState> {
  const brainDir = getBrainDir(cwd);
  ensureDir(brainDir);

  const projectName = getProjectName(cwd) || "unnamed-project";
  const initialBrain = createEmptyBrainState(projectName);

  await writeBrainState(getBrainJsonPath(cwd), initialBrain);
  await writeBrainConfig(getConfigPath(cwd), createDefaultConfig());

  return initialBrain;
}

async function readBrainState(path: string): Promise<BrainState> {
  const content = await readFile(path);
  return JSON.parse(content) as BrainState;
}

async function writeBrainState(path: string, state: BrainState): Promise<void> {
  await writeFile(path, JSON.stringify(state, null, 2));
}

async function readBrainConfig(path: string): Promise<BrainConfig> {
  const content = await readFile(path);
  return JSON.parse(content) as BrainConfig;
}

async function writeBrainConfig(
  path: string,
  config: BrainConfig,
): Promise<void> {
  await writeFile(path, JSON.stringify(config, null, 2));
}

async function saveHistorySnapshot(
  cwd: string,
  state: BrainState,
  diff: any,
): Promise<void> {
  const historyDir = getHistoryDir(cwd);
  ensureDir(historyDir);

  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:]/g, "-");
  const sessionNumber = state.sessionCount;
  const filename = `s${sessionNumber.toString().padStart(3, "0")}_${timestamp}.json`;
  const path = `${historyDir}/${filename}`;

  await writeFile(
    path,
    JSON.stringify(
      {
        session: sessionNumber,
        timestamp: new Date().toISOString(),
        summary: `Session ${sessionNumber} update`,
        brainSnapshot: state,
        diff,
      },
      null,
      2,
    ),
  );
}
