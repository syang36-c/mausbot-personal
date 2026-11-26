import { readFileSync } from "node:fs";
import { parseEnv } from "node:util";

import { WORKSPACE_CREDENTIAL_ENV } from "./credential-env.ts";

const NOT_KEYS = new Set(["OMB_BROWSER_CONNECTION", "OMB_USER_DATA", "OMB_BOAT_API"]);
const KEY_NAMES: ReadonlySet<string> = new Set(WORKSPACE_CREDENTIAL_ENV.filter((name) => !NOT_KEYS.has(name)));

export interface KeysFileResult {
  loaded: string[];
  /** Names that are not a key the server reads; a stray one such as ANTHROPIC_API_KEY would otherwise reach engine CLIs. */
  ignored: string[];
}

/** Applies a keys file (dotenv syntax) over `env`: each key it names with a value wins; null when the file does not exist. */
export function applyKeysFile(file: string, env: NodeJS.ProcessEnv = process.env): KeysFileResult | null {
  let text: string;
  try {
    text = readFileSync(file, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
  const result: KeysFileResult = { loaded: [], ignored: [] };
  for (const [name, value] of Object.entries(parseEnv(text))) {
    if (!KEY_NAMES.has(name)) result.ignored.push(name);
    else if (value) {
      env[name] = value;
      result.loaded.push(name);
    }
  }
  return result;
}
