import { writeFile, access } from "node:fs/promises";
import { dirname } from "node:path";
import { mkdir } from "node:fs/promises";
import type { Result } from "../types.js";

/**
 * Create a new file with the given content.
 * Fails if the file already exists to prevent accidental overwrites.
 * Creates parent directories as needed.
 */
export async function createFile(
  path: string,
  content: string,
): Promise<Result<string>> {
  try {
    await access(path);
    return { ok: false, error: `File already exists: ${path}` };
  } catch {
    // File doesn't exist — this is the expected path
  }

  try {
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, content, "utf-8");
    return { ok: true, data: `Created ${path}` };
  } catch (error) {
    return { ok: false, error: `Failed to create ${path}: ${error instanceof Error ? error.message : String(error)}` };
  }
}