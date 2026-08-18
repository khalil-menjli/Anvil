import { homedir } from "node:os";
import { join } from "node:path";
import { writeFile, readFile, mkdir, access } from "node:fs/promises";
import { input } from "@inquirer/prompts";

const CONFIG_PATH = join(homedir(), ".anvil", "config.json");

export async function loadConfig(): Promise<string> {
  try {
    const content = await readFile(CONFIG_PATH, "utf-8");
    const config = JSON.parse(content) as { apiKey: string };
    return config.apiKey;
  } catch {
    const apiKey = await input({
      message: "Enter your API key to continue",
      validate: (apiKey) => {
        if (apiKey.trim().length === 0) {
          return "API key cannot be empty";
        }
        return true;
      },
    });
    if (apiKey) {
      (await mkdir(join(homedir(), ".anvil")), { recursive: true });
      await writeFile(
        CONFIG_PATH,
        JSON.stringify({ apiKey: apiKey.trim() }, null, 2),
        { encoding: "utf-8", mode: 0o600 },
      );
    }
    return apiKey.trim();
  }
}
