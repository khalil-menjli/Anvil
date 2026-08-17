import type OpenAI from "openai";

/**
 * Tool definitions exposed to the model.
 * Each entry describes a function the agent can call.
 */
export const tools: OpenAI.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "read_file",
      description: "Read the contents of a file at the given path",
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "The path to the file to read",
          },
        },
        required: ["path"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_dir",
      description: "List the files and folders at the given path",
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "The directory path to list",
          },
        },
        required: ["path"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "str_replace",
      description: "Replace an exact string in a file with new text",
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "The file to edit",
          },
          old_str: {
            type: "string",
            description:
              "The exact text to replace — must appear exactly once in the file",
          },
          new_str: {
            type: "string",
            description: "The new text to replace it with",
          },
        },
        required: ["path", "old_str", "new_str"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_file",
      description:
        "Create a new file with the given content. Fails if the file already exists.",
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "The path where the file should be created",
          },
          content: {
            type: "string",
            description: "The content to write to the file",
          },
        },
        required: ["path", "content"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "run_bash",
      description:
        "Run a shell command in the project directory. Use for running tests, installing packages, git operations, and other terminal tasks.",
      parameters: {
        type: "object",
        properties: {
          command: {
            type: "string",
            description: "The shell command to execute",
          },
          timeout: {
            type: "number",
            description: "Max seconds to wait. Defaults to 30, max 600.",
          },
        },
        required: ["command"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "grep",
      description:
        "Search for a text pattern across files in the project and return matching lines with their file paths and line numbers.",
      parameters: {
        type: "object",
        properties: {
          patterns: {
            type: "string",
            description: "The text pattern to search for.",
          },
          source: {
            type: "string",
            description:
              "The file or directory pattern to search in. Defaults to 'src/**/**'.",
          },
        },
        required: ["patterns"],
      },
    },
  },
];
