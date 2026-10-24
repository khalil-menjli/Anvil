import OpenAI from "openai";
import { tools, toolRegistry } from "./tools/index.js";
import { Spinner } from "./ui/spinner.js";
import type { Provider } from "./types.js";

const SYSTEM_PROMPT = `You are Anvil, an autonomous CLI coding agent. You can read files, list directories, edit files, and create new files. Be precise with edits — always match whitespace and indentation exactly.`;

/**
 * Maximum number of model round-trips (turns) allowed in one run.
 * A healthy run finishes well below this. Reaching the cap usually means
 * the model is stuck in a loop — not that it just needs "a few more turns".
 */
const MAX_TURNS = 25;

const spinner = new Spinner();
/**
 * Execute a single function-type tool call by looking up its handler in the registry.
 */
async function executeFunctionToolCall(
  toolCall: OpenAI.ChatCompletionMessageToolCall & { type: "function" },
): Promise<string> {
  const { name, arguments: rawArgs } = toolCall.function;
  const handler = toolRegistry[name];

  if (!handler) {
    return `Unknown tool: ${name}`;
  }
  let args: Record<string, unknown>;
  try {
    args = JSON.parse(rawArgs) as Record<string, unknown>;
  } catch {
    return `Error: arguments were not valid JSON. Resend valid JSON matching the tool schema.`;
  }

  return handler(args);
}

/**
 * Run the agentic loop: send messages to the model, execute tool calls,
 * and repeat until the model produces a final text response.
 */
export async function runAgent(
  userMessage: string,
  provider: Provider,
): Promise<void> {
  const client = new OpenAI({
    baseURL: provider.baseURL,
    apiKey: provider.apiKey,
  });
  const messages: OpenAI.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userMessage },
  ];

  let turn = 0;
  while (true) {
    // Budget check happens BEFORE the API call: when the turn cap is reached,
    // give the model one final call WITHOUT tools so it can summarize the
    // work instead of being cut off mid-task with no explanation.
    if (turn >= MAX_TURNS) {
      messages.push({
        role: "user",
        content:
          "You have used all your available tool calls. Do not try to continue the task. Summarize the progress so far: what was completed, what remains, and what the user can do next.",
      });
      spinner.start("Wrapping up...");
      const response = await client.chat.completions.create({
        model: provider.model,
        messages,
      });
      spinner.stop("Wrapping up");
      const finalContent = response.choices[0]?.message?.content;
      if (finalContent) {
        console.log(finalContent);
      }
      return;
    }
    turn++;

    spinner.start("Thinking...");
    const response = await client.chat.completions.create({
      model: provider.model,
      messages,
      tools,
    });
    spinner.stop("Thinking");
    const choice = response.choices[0];
    if (!choice) {
      throw new Error("Empty response from model");
    }

    // Final text response — print and exit
    if (choice.finish_reason === "stop") {
      const content = choice.message.content;
      if (content) {
        console.log(content);
      }
      break;
    }

    // Append the assistant's message (may contain tool_calls)
    messages.push(choice.message);

    // Process tool calls
    if (choice.finish_reason === "tool_calls" && choice.message.tool_calls) {
      for (const toolCall of choice.message.tool_calls) {
        if (toolCall.type !== "function") continue;

        const result = await executeFunctionToolCall(toolCall);

        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: result,
        });
      }
    }
  }
}
