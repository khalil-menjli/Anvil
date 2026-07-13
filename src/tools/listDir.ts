import { readdir } from "node:fs/promises";
import type { Result } from "../types.js";

/**
 * List files and directories at the given path.
 */
export async function listDir(path: string): Promise<Result<string[]>> {
  try {
    const entries = await readdir(path);
    return { ok: true, data: entries };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}
