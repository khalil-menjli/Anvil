import { readFile } from "node:fs/promises";
import type { Result } from "../types.js";

/**
 * Read the full contents of a file as UTF-8 text.
 */
export async function readFileContents(path: string): Promise<Result<string>> {
  try {
    const contents = await readFile(path, "utf-8");
    return { ok: true, data: contents };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}
