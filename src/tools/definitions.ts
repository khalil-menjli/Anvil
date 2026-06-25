export const tools = [
  {
    type: "function" as const,
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
    type: "function" as const,
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
  type: "function" as const,
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
          description: "The exact text to replace — must appear exactly once in the file",
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
];
