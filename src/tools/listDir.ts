import { readdir } from "node:fs/promises";

export async function listDir(path: string): Promise<string[]> {
  return await readdir(path);
}
