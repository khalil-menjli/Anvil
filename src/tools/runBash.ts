import { exec } from "node:child_process";
import { promisify } from "node:util";
import type { Result } from "../types.js";

const promisifiedExec = promisify(exec);

export async function runBash(
  command: string,
  timeoutSeconds: number = 30,
): Promise<Result<string>> {
  try {
    const { stdout, stderr } = await promisifiedExec(command, {
      timeout: Math.min(timeoutSeconds, 600) * 1000,
      cwd: process.cwd(), //run this bash command in whatever folder the user was in when they ran anvil
      encoding: "utf-8",
    });
    return { ok: true, data: stdout + stderr };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
