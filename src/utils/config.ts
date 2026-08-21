import { homedir } from "node:os";
import { join } from "node:path";
import { writeFile, readFile, mkdir } from "node:fs/promises";
import { input } from "@inquirer/prompts";
import type { AnvilConfig, Provider } from "../types.js";

const CONFIG_PATH = join(homedir(), ".anvil", "config.json");

function getProvider(name: string, config: AnvilConfig): Provider {
  const provider = config.providers[name];

  if (!provider) throw new Error(`Provider "${name}" not found in config`);
  return provider;
}

export async function loadConfig(providername?: string): Promise<Provider> {
  try {
    const content = await readFile(CONFIG_PATH, "utf-8");
    const config = JSON.parse(content) as AnvilConfig;

    if (providername) {
      return getProvider(providername, config);
    }
    return getProvider(config.defaultProvider, config);
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
    const defaultProvider: Provider = {
      apiKey: apiKey.trim(),
      model: "mistral-large",
      baseURL: "https://router.bynara.id/v1",
    };
    const config: AnvilConfig = {
      providers: { naraya: defaultProvider },
      defaultProvider: "naraya",
    };

    await mkdir(join(homedir(), ".anvil"), { recursive: true });
    await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), {
      encoding: "utf-8",
      mode: 0o600,
    });

    return defaultProvider;
  }
}
