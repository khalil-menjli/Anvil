import { resolve } from "node:path";

export function isSafePath(path: string): boolean {
  const currentPath = process.cwd();

  return resolve(path).startsWith(currentPath);
}
