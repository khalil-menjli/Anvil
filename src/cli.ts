#!/usr/bin/env node

import "dotenv/config";
import { runAgent } from "./agent.js";

const message = process.argv[2];
if (!message) {
  console.error("Usage: anvil <message>");
  process.exit(1);
}

if (!process.env["NARAYA_API_KEY"]) {
  console.error(
    "Missing NARAYA_API_KEY environment variable. Set it in your .env file.",
  );
  process.exit(1);
}

try {
  await runAgent(message);
} catch (error) {
  console.error("Fatal:", error instanceof Error ? error.message : error);
  process.exit(1);
}
