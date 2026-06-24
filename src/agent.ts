import OpenAI from "openai";
import { tools } from "./tools/definitions.js";
import { readF, listDir } from "./tools/index.js";
//NARAYA_API
const client = new OpenAI({
  baseURL: "https://router.bynara.id/v1",
  apiKey: process.env.NARAYA_API_KEY,
});

export async function runAgent(userMessage: string): Promise<void> {
  const messages: OpenAI.ChatCompletionMessageParam[] = [
    { role: "user", content: userMessage },
  ];
  while (true) {
    try {
      const response = await client.chat.completions.create({
        model: "mimo-v2.5-pro-free",
        messages,
        tools,
      });

      const choice = response.choices[0];
      if (!choice) {
        console.error("empty response from model");
        process.exit(1);
      }

      const stopReason = choice.finish_reason;
      if (stopReason === "stop") {
        const content = choice.message.content;
        if (!content) {
          console.error("no text content in response");
          process.exit(1);
        }

        console.log(content);
        break;
      }
      messages.push(choice.message);
      if (stopReason === "tool_calls") {
        const toolCalls = choice.message.tool_calls;
        if (toolCalls) {
          for (const toolCall of toolCalls) {
            if (toolCall.type !== "function") continue; // skip non-function tool calls
            const args = JSON.parse(toolCall.function.arguments);
            // console.log(args.path);
            let result: string;

            if (toolCall.function.name === "read_file") {
              result = await readF(args.path);
            } else if (toolCall.function.name === "list_dir") {
              result = (await listDir(args.path)).join("\n");
            } else {
              result = "Unknown tool ";
            }
            messages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: result,
            });
          }
        }
      }
    } catch (error) {
      console.error("API call failed:", error);
      process.exit(1);
    }
  }
}
