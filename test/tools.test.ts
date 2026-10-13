
import { afterEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  mkdtemp,
  mkdir,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { readFileContents } from "../src/tools/readFile.js";
import { listDir } from "../src/tools/listDir.js";
import { strReplace } from "../src/tools/strReplace.js";
import { createFile } from "../src/tools/createFile.js";
import { runBash } from "../src/tools/runBash.js";
import { grep } from "../src/tools/grep.js";

let tempDirs: string[] = [];

async function createTempDir(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "anvil-test-"));
  tempDirs.push(dir);
  return dir;
}

afterEach(async () => {
  await Promise.all(
    tempDirs.map((dir) => rm(dir, { recursive: true, force: true })),
  );
  tempDirs = [];
});

describe("readFileContents", () => {
  it("reads a file successfully", async () => {
    const dir = await createTempDir();
    const path = join(dir, "hello.txt");

    await writeFile(path, "Hello, Anvil!", "utf8");

    assert.deepEqual(await readFileContents(path), {
      ok: true,
      data: "Hello, Anvil!",
    });
  });

  it("preserves Unicode and punctuation", async () => {
    const dir = await createTempDir();
    const path = join(dir, "text.txt");
    const content = "Hello, Anvil! Version 1.0 — café.";

    await writeFile(path, content, "utf8");

    assert.deepEqual(await readFileContents(path), {
      ok: true,
      data: content,
    });
  });

  it("returns an error when the file does not exist", async () => {
    const dir = await createTempDir();
    const result = await readFileContents(join(dir, "missing.txt"));

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.ok(result.error.length > 0);
    }
  });
});

describe("listDir", () => {
  it("lists files and subdirectories", async () => {
    const dir = await createTempDir();

    await writeFile(join(dir, "file.txt"), "content");
    await mkdir(join(dir, "nested"));

    const result = await listDir(dir);

    assert.equal(result.ok, true);
    if (result.ok) {
      assert.deepEqual(
        [...result.data].sort(),
        ["file.txt", "nested"],
      );
    }
  });

  it("returns an error for a missing directory", async () => {
    const dir = await createTempDir();
    const result = await listDir(join(dir, "missing"));

    assert.equal(result.ok, false);
  });

  it("returns an empty array for an empty directory", async () => {
    const dir = await createTempDir();
    const result = await listDir(dir);

    assert.deepEqual(result, { ok: true, data: [] });
  });
});

describe("strReplace", () => {
  it("replaces one exact occurrence in memory", async () => {
    const dir = await createTempDir();
    const path = join(dir, "code.ts");

    await writeFile(path, "const name = 'Anvil';", "utf8");

    const result = await strReplace(path, "'Anvil'", "'Anvil CLI'");

    assert.deepEqual(result, {
      ok: true,
      data: "const name = 'Anvil CLI';",
    });
  });

  it("does not modify the original file", async () => {
    const dir = await createTempDir();
    const path = join(dir, "code.ts");

    await writeFile(path, "const value = 1;", "utf8");

    await strReplace(path, "1", "2");

    assert.equal(await readFile(path, "utf8"), "const value = 1;");
  });

  it("rejects a string that does not exist", async () => {
    const dir = await createTempDir();
    const path = join(dir, "code.ts");

    await writeFile(path, "const value = 1;", "utf8");

    const result = await strReplace(path, "missing", "replacement");

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.match(result.error, /Could not find/);
    }
  });

  it("rejects ambiguous replacements", async () => {
    const dir = await createTempDir();
    const path = join(dir, "code.ts");

    await writeFile(path, "foo + foo", "utf8");

    const result = await strReplace(path, "foo", "bar");

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.match(result.error, /Found 2 matches/);
    }
  });

  it("returns an error when the file does not exist", async () => {
    const dir = await createTempDir();

    const result = await strReplace(
      join(dir, "missing.ts"),
      "old",
      "new",
    );

    assert.equal(result.ok, false);
  });
});

describe("createFile", () => {
  it("creates a file with the requested content", async () => {
    const dir = await createTempDir();
    const path = join(dir, "new.txt");

    const result = await createFile(path, "Created by Anvil");

    assert.deepEqual(result, {
      ok: true,
      data: `Created ${path}`,
    });
    assert.equal(await readFile(path, "utf8"), "Created by Anvil");
  });

  it("creates missing parent directories", async () => {
    const dir = await createTempDir();
    const path = join(dir, "nested", "deep", "file.txt");

    const result = await createFile(path, "nested content");

    assert.equal(result.ok, true);
    assert.equal(await readFile(path, "utf8"), "nested content");
  });

  it("does not overwrite an existing file", async () => {
    const dir = await createTempDir();
    const path = join(dir, "existing.txt");

    await writeFile(path, "original", "utf8");

    const result = await createFile(path, "replacement");

    assert.deepEqual(result, {
      ok: false,
      error: `File already exists: ${path}`,
    });
    assert.equal(await readFile(path, "utf8"), "original");
  });
});

describe("runBash", () => {
  it("returns successful command output", async () => {
    const result = await runBash(
      'node -e "process.stdout.write(\'hello\')"',
    );

    assert.deepEqual(result, { ok: true, data: "hello" });
  });

  it("returns an error when a command fails", async () => {
    const result = await runBash(
      'node -e "process.exit(2)"',
    );

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.ok(result.error.length > 0);
    }
  });

  it("returns an error when a command times out", async () => {
    const result = await runBash(
      'node -e "setTimeout(() => {}, 5000)"',
      1,
    );

    assert.equal(result.ok, false);
  });

  it("returns standard output and standard error", async () => {
    const result = await runBash(
      'node -e "process.stdout.write(\'out\'); process.stderr.write(\'err\')"',
    );

    assert.deepEqual(result, { ok: true, data: "outerr" });
  });
});

describe("grep", () => {
  it("finds matching lines and reports line numbers", async () => {
    const dir = await createTempDir();
    const path = join(dir, "example.ts");

    await writeFile(
      path,
      "const first = 1;\nconst target = 2;\nconst last = 3;",
      "utf8",
    );

    const result = await grep("target", path);

    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.data, `${path}:2: const target = 2;`);
    }
  });

  it("returns a message when there are no matches", async () => {
    const dir = await createTempDir();
    const path = join(dir, "example.ts");

    await writeFile(path, "const value = 1;", "utf8");

    assert.deepEqual(await grep("not-found", path), {
      ok: true,
      data: "No matches found.",
    });
  });

  it("finds matches across multiple files", async () => {
    const dir = await createTempDir();
    const first = join(dir, "first.ts");
    const second = join(dir, "second.ts");

    await writeFile(first, "needle in first file", "utf8");
    await writeFile(second, "needle in second file", "utf8");

    const result = await grep("needle", join(dir, "*.ts"));

    assert.equal(result.ok, true);
    if (result.ok) {
      assert.match(result.data, /first\.ts:1: needle in first file/);
      assert.match(result.data, /second\.ts:1: needle in second file/);
    }
  });
});
