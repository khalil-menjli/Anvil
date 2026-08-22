#!/usr/bin/env node

import { runAgent } from "./agent.js";
import { loadConfig } from "./utils/config.js";
import { Command } from "commander";

const program = new Command();

program
  .name("anvil")
  .description("An autonomous CLI coding agent")
  .argument("<message>", "what you want anvil to do")
  .option("--provider <name>", "which provider to use", "naraya")
  .option("--model <name>", "override the model")
  .action(async (message, options) => {
    try {
      const provider = await loadConfig(options.provider);
      await runAgent(message, provider);
    } catch (error) {
      console.error("Fatal:", error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program.parse();