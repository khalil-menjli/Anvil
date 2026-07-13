import { readFile } from "node:fs/promises";
import type { Result } from "../types.js";

/**
 * Replace an exact string occurrence in a file's contents.
 * The old string must appear exactly once to avoid ambiguous edits.
 * Returns the new file content on success (does NOT write to disk).
 */
export async function strReplace(
  path: string,
  oldStr: string,
  newStr: string,
): Promise<Result<string>> {
  let fileContent: string;

  try {
    fileContent = await readFile(path, "utf-8");
  } catch (error) {
    return { ok: false, error: `Failed to read ${path}: ${error instanceof Error ? error.message : String(error)}` };
  }

  const occurrences = fileContent.split(oldStr).length - 1;

  if (occurrences === 0) {
    return {
      ok: false,
      error: `Could not find the text to replace in ${path}. Make sure oldStr matches exactly, including whitespace and indentation.`,
    };
  }

  if (occurrences > 1) {
    return {
      ok: false,
      error: `Found ${occurrences} matches in ${path}. Make oldStr more specific by including more surrounding context.`,
    };
  }

  const newContent = fileContent.replace(oldStr, newStr);
  return { ok: true, data: newContent };
}
