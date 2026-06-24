import { readFile } from "node:fs/promises";

export async function readF(path: string): Promise<string> {
  const fileContents = await readFile(path, "utf-8");
  return fileContents;
}
