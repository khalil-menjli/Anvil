# Anvil

A CLI coding agent that reads, writes, edits, and searches your codebase using AI — with your approval before every change.

## What it does

Anvil runs an agentic loop: it calls an AI model, lets the model use tools to explore and edit your project, and asks for your approval before applying any change to disk.

**Available tools:**

- `read_file` — read any file in your project
- `list_dir` — list files and folders in a directory
- `str_replace` — edit a file via exact string replacement (shows a diff before applying)
- `create_file` — create a new file (shows a preview before creating)
- `run_bash` — run a shell command (always asks approval first)
- `grep` — search for a text pattern across your codebase

## Requirements

- Node.js v18 or higher
- An API key from any OpenAI-compatible provider (naraya, OpenAI, etc.)

## Installation

```bash
git clone https://github.com/khalil-menjli/Anvil.git
cd Anvil
npm install
npm run build
npm link
```

On first run, Anvil will ask for your API key and save it to `~/.anvil/config.json`.

## Usage

```bash
# basic usage
anvil "what does cli.ts do?"

# read and explain a file
anvil "read src/agent.ts and explain how the agent loop works"

# edit a file
anvil "add error handling to the runBash function in src/tools/runBash.ts"

# search the codebase
anvil "find all places where runAgent is called"

# run a command
anvil "run the tests and fix any failures"

# use a specific provider
anvil --provider naraya "say hello"
```

## Providers

Anvil works with any OpenAI-compatible API.

To add a new provider, edit `~/.anvil/config.json`:

```json
{
  "providers": {
    "naraya": {
      "apiKey": "your-key",
      "model": "mistral-large",
      "baseURL": "https://router.bynara.id/v1"
    },
    "openai": {
      "apiKey": "your-openai-key",
      "model": "gpt-4o",
      "baseURL": "https://api.openai.com/v1"
    }
  },
  "defaultProvider": "naraya"
}
```

Then switch providers with the `--provider` flag:

```bash
anvil --provider openai "fix the bug in src/agent.ts"
```

## Safety

- Every file edit shows a colored diff and requires `y/n` approval
- Every bash command shows the exact command and requires `y/n` approval
- File operations are restricted to your current project directory
- Paths outside the project require explicit approval

## Tech stack

- **Runtime**: Node.js + TypeScript (strict mode)
- **Agent loop**: OpenAI-compatible API with tool use
- **Tools**: fs/promises, child_process, fast-glob, diff, chalk
- **CLI**: commander, @inquirer/prompts

## License

MIT