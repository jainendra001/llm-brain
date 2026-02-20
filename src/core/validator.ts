import {
  BrainStateSchema,
  BrainConfigSchema,
  type BrainState,
  type BrainConfig,
} from "../types/brain.js";
import { ZodError } from "zod";

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: string[];
}

export function validateBrainState(
  data: unknown,
): ValidationResult<BrainState> {
  try {
    const result = BrainStateSchema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = error.errors.map(
        (e) => `${e.path.join(".")}: ${e.message}`,
      );
      return { success: false, errors };
    }
    return { success: false, errors: ["Unknown validation error"] };
  }
}

export function validateBrainConfig(
  data: unknown,
): ValidationResult<BrainConfig> {
  try {
    const result = BrainConfigSchema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = error.errors.map(
        (e) => `${e.path.join(".")}: ${e.message}`,
      );
      return { success: false, errors };
    }
    return { success: false, errors: ["Unknown validation error"] };
  }
}

export function isValidBrainState(data: unknown): data is BrainState {
  return validateBrainState(data).success;
}

export function isValidBrainConfig(data: unknown): data is BrainConfig {
  return validateBrainConfig(data).success;
}
