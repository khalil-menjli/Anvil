#!/usr/bin/env node

import { runAgent } from "./agent.js";
import { loadConfig } from "./utils/config.js";

const message = process.argv[2];
if (!message) {
  console.error("Usage: anvil <message>");
  process.exit(1);
}
const apiKey = await loadConfig();
if (!apiKey) {
  console.error(
    "Missing NARAYA_API_KEY environment variable. Set it in your .env file.",
  );
  process.exit(1);
}

try {
  await runAgent(message, apiKey);
} catch (error) {
  console.error("Fatal:", error instanceof Error ? error.message : error);
  process.exit(1);
}
