import OpenAI from "openai";
import { tools, toolRegistry } from "./tools/index.js";
import { Spinner } from "./ui/spinner.js";

const SYSTEM_PROMPT = `You are Anvil, an autonomous CLI coding agent. You can read files, list directories, edit files, and create new files. Be precise with edits — always match whitespace and indentation exactly.`;

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
  const args = JSON.parse(rawArgs) as Record<string, unknown>;
  return handler(args);
}

/**
 * Run the agentic loop: send messages to the model, execute tool calls,
 * and repeat until the model produces a final text response.
 */
export async function runAgent(
  userMessage: string,
  apiKey: string,
): Promise<void> {
  const client = new OpenAI({
    baseURL: "https://router.bynara.id/v1",
    apiKey,
  });
  const messages: OpenAI.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userMessage },
  ];

  while (true) {
    spinner.start("Thinking...");
    const response = await client.chat.completions.create({
      model: "mistral-large",
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
