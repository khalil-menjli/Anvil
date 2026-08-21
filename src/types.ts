/**
 * Discriminated union for operations that can succeed or fail.
 * Use `result.ok` to narrow the type before accessing data/error.
 */
export type Result<T> = { ok: true; data: T } | { ok: false; error: string };

/**
 * A tool handler receives parsed arguments and returns a string result
 * suitable for sending back to the model.
 */
export type ToolHandler = (args: Record<string, unknown>) => Promise<string>;

export type Provider = {
  apiKey: string;
  model: string;
  baseURL: string;
};

export type AnvilConfig = {
  providers: Record<string, Provider>;
  defaultProvider: string;
};
