# Anvil

<p align="center">
  <em>An autonomous CLI coding agent that reads, edits, and searches your codebase using AI — always asking for your approval before touching a file.</em>
</p>

<p align="center">
  <!-- Uncomment after publishing to npm -->
  <!-- <a href="https://www.npmjs.com/package/anvilcli"><img alt="npm version" src="https://img.shields.io/npm/v/anvilcli?color=cb3837&logo=npm"></a> -->
  <a href="https://www.npmjs.com/package/anvilcli"><img alt="License" src="https://img.shields.io/badge/license-MIT-green.svg"></a>
  <img alt="Node.js" src="https://img.shields.io/badge/node-%3E%3D18-brightgreen?logo=nodedotjs">
  <a href="https://github.com/khalil-menjli/Anvil"><img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-strict-blue?logo=typescript"></a>
</p>

Anvil runs an **agentic loop**: it calls an AI model, lets the model use tools to explore and edit your project, and asks for your approval before applying any change to disk. Think of it as a minimal, transparent alternative to commercial AI coding agents — built from scratch.

<!-- Add a demo GIF here for maximum impact:
<p align="center"><img src="docs/demo.gif" alt="Anvil in action" width="700"></p>
-->

## Highlights

- ✅ **Autonomous agent loop** — model plans, calls tools, and iterates until your task is done
- 🔒 **Safety-first design** — every file edit and shell command requires explicit `y/n` approval, with diffs shown before anything is written
- 🛡️ **Path sandboxing** — file operations are restricted to the current project directory
- 🔌 **Provider-agnostic** — works with any OpenAI-compatible API (OpenAI, and others) via a simple config
- ⚡ **Built like a real CLI tool** — `npm` package, global command, strict TypeScript

## Tools the agent can use

| Tool | Description |
|---|---|
| `read_file` | Read any file in your project |
| `list_dir` | List files and folders in a directory |
| `str_replace` | Edit a file via exact string replacement (diff preview before applying) |
| `create_file` | Create a new file (preview before creating) |
| `run_bash` | Run a shell command (always asks approval first) |
| `grep` | Search for a text pattern across the codebase |

## Installation

### Requirements

- Node.js **v18 or higher** ([download here](https://nodejs.org))
- An API key from any OpenAI-compatible provider

### Option 1 — From npm (simplest)

```bash
npm install -g anvilcli
```

### Option 2 — Install from source (for contributors)

```bash
git clone https://github.com/khalil-menjli/Anvil.git
cd Anvil
npm install          # installs dependencies and builds automatically
npm install -g .     # registers the global `anvil` command
```

> **Permission denied on the last step?** The global npm folder is owned by root on many Linux systems. Two easy fixes:
>
> **Linux / macOS (no sudo needed, one-time):**
> ```bash
> mkdir -p ~/.npm-global
> npm config set prefix ~/.npm-global
> export PATH="$HOME/.npm-global/bin:$PATH"   # add this line to ~/.bashrc or ~/.zshrc
> npm install -g .
> ```
>
> **Windows:** open the terminal (Command Prompt / PowerShell) as Administrator and run `npm install -g .` again.

### Windows tip

After installing, run `anvil --help` in a **new** terminal window so the freshly updated `PATH` is picked up.

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

On first run, Anvil asks for your API key and saves it to `~/.anvil/config.json` (permissions `0600` — only readable by you). After that it just works.

## Providers

Anvil works with any OpenAI-compatible API. Add providers in `~/.anvil/config.json`:

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

## Safety model

- Every file edit shows a **colored diff** and requires a `y/n` approval
- Every bash command shows the **exact command** and requires approval
- File operations are **restricted to your current project directory** — paths outside it need explicit approval
- Config and log files are created with `0600` permissions so your API key is only readable by you

## Development & contributing

```bash
git clone https://github.com/khalil-menjli/Anvil.git
cd Anvil
npm install          # installs + builds (dist/ is generated automatically)
npm run dev          # run directly from TypeScript source
npm test             # run the test suite
npm run build        # compile to dist/
```

### Project structure

```text
src/
├── cli.ts               # CLI entry point (command parsing, flags)
├── agent.ts             # the agentic loop: model ↔ tools ↔ approval
├── types.ts             # shared type definitions
├── tools/               # agent tools: readFile, strReplace, runBash, grep...
├── ui/                  # terminal UI: diffs, prompts, spinner
└── utils/               # config storage, path safety
```

Pull requests are welcome — open an issue first to discuss what you'd like to change.

## Tech stack

- **Language**: TypeScript (strict mode) — compiled with `tsc`
- **Runtime**: Node.js ≥ 18
- **Agent loop**: OpenAI-compatible API with tool use / function calling
- **Tools**: `fs/promises`, `child_process`, `fast-glob`, `diff`, `chalk`
- **Cli**: `commander`, `@inquirer/prompts`

## Author

Built by **[Khalil Menjli](https://github.com/khalil-menjli)** — feel free to reach out.

## License

MIT
