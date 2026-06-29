import { readFile } from "node:fs/promises";

export async function strReplace(
  path: string,
  oldStr: string,
  newStr: string,
): Promise<{newContent: string} | {error: string} > {
  const fileContent = await readFile(path, "utf-8");

  const occurrences = fileContent.split(oldStr).length - 1;
  if (occurrences === 0) {
    
    return  {error:`Error: could not find the text to replace in ${path}. Make sure oldStr matches exactly, including whitespace and indentation.`}
  }

  if (occurrences > 1) {
    return {
      error: `Error: found ${occurrences} matches in ${path}. Make oldStr more specific by including more surrounding context.`,
    };
  }

  const newContent = fileContent.replace(oldStr, newStr);

  return { newContent };
}
