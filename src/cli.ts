import "dotenv/config"
import OpenAI from "openai";

const message = process.argv[2];
if (!message) {
    console.error("no message");
    process.exit(1)
}

const client = new OpenAI({
  baseURL: "https://router.bynara.id/v1",
  apiKey: process.env.NARAYA_API_KEY, 
});
 
try {
  const response = await client.chat.completions.create({
    model: "deepseek-3.2",
    messages: [{ role: "user", content: message }],
  });

  const choice = response.choices[0];
  if (!choice) {
    console.error("empty response from model");
    process.exit(1);
  }

  const content = choice.message.content;
  if (!content) {
    console.error("no text content in response");
    process.exit(1);
  }

  console.log(content);
} catch (error) {
  console.error("API call failed:", error);
  process.exit(1);
}