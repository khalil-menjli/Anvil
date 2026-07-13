import { writeFile } from "node:fs/promises";
import type { ToolHandler } from "../types.js";
import { readFileContents } from "./readFile.js";
import { listDir } from "./listDir.js";
import { strReplace } from "./strReplace.js";
import { createFile } from "./createFile.js";
import { printDiff, askApproval } from "../ui/index.js";

/**
 * Registry mapping tool names to their handler functions.
 * Each handler receives raw parsed arguments and returns a string result
 * to feed back to the model.
 */
export const toolRegistry: Record<string, ToolHandler> = {
  read_file: async (args) => {
    const path = args.path as string;
    const result = await readFileContents(path);
    return result.ok ? result.data : result.error;
  },

  list_dir: async (args) => {
    const path = args.path as string;
    const result = await listDir(path);
    return result.ok ? result.data.join("\n") : result.error;
  },

  str_replace: async (args) => {
    const path = args.path as string;
    const oldStr = args.old_str as string;
    const newStr = args.new_str as string;

    const result = await strReplace(path, oldStr, newStr);
    if (!result.ok) return result.error;

    // Show diff and ask for user approval before writing
    const oldFileResult = await readFileContents(path);
    const oldContent = oldFileResult.ok ? oldFileResult.data : "";

    printDiff(oldContent, result.data);

    const approved = await askApproval("Apply this change?");
    if (!approved) return `User rejected the change to ${path}`;

    await writeFile(path, result.data, "utf-8");
    return `Successfully edited ${path}`;
  },

  create_file: async (args) => {
    const path = args.path as string;
    const content = args.content as string;

    // Show content preview and ask for approval
    printDiff("", content);

    const approved = await askApproval(`Create ${path}?`);
    if (!approved) return `User rejected creating ${path}`;

    const result = await createFile(path, content);
    return result.ok ? result.data : result.error;
  },
};
