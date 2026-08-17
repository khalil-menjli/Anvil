import fg from "fast-glob";
import type { Result } from "../types.js";
import { readFileContents } from "./index.js";

export async function grep(
  patterns: string,
  source: string = "src/**/**",
): Promise<Result<string>> {
  try {
    const entries = await fg.async(source, {
      ignore: ["node_modules/**", "dist/**", ".git/**"],
      dot: false,
    });
    let matches: string[] = [];
    await Promise.all(
      entries.map(async (entrie) => {
        const contents = await readFileContents(entrie);
        if (contents.ok) {
          contents.data.split("\n").forEach((line, index) => {
            if (line.includes(patterns)) {
              matches.push(`${entrie}:${index + 1}: ${line}`);
            }
          });
        }
      }),
    );
    if (matches.length === 0) {
      return { ok: true, data: "No matches found." };
    }
    return { ok: true, data: matches.join("\n") };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
