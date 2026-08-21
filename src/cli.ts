#!/usr/bin/env node

import { runAgent } from "./agent.js";
import { loadConfig } from "./utils/config.js";

const message = process.argv[2];
if (!message) {
  console.error("Usage: anvil <message>");
  process.exit(1);
}
const provider = await loadConfig();

try {
  await runAgent(message, provider);
} catch (error) {
  console.error("Fatal:", error instanceof Error ? error.message : error);
  process.exit(1);
}
