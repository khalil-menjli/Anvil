//cli.ts
import "dotenv/config";
import { runAgent } from "./agent.js";

const message = process.argv[2];
if (!message) {
  console.error("no message");
  process.exit(1);
}
await runAgent(message);
