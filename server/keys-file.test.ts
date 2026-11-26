import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { applyKeysFile } from "./keys-file.ts";

function keysFile(text: string): string {
  const file = join(mkdtempSync(join(tmpdir(), "omb-keys-")), ".env");
  writeFileSync(file, text);
  return file;
}

describe("applyKeysFile", () => {
  it("applies the keys it names over the environment", () => {
    const env: NodeJS.ProcessEnv = { COMPOSIO_API_KEY: "ak_from_shell", PATH: "/usr/bin" };
    const result = applyKeysFile(keysFile('COMPOSIO_API_KEY=ak_from_file\nBOX_TOKEN="boat_x"\n# a comment\n'), env);
    expect(result?.loaded.sort()).toEqual(["BOX_TOKEN", "COMPOSIO_API_KEY"]);
    expect(result?.ignored).toEqual([]);
    expect(env).toEqual({ COMPOSIO_API_KEY: "ak_from_file", BOX_TOKEN: "boat_x", PATH: "/usr/bin" });
  });

  it("ignores names that are not keys and leaves an empty value unset", () => {
    const env: NodeJS.ProcessEnv = { BOX_TOKEN: "boat_saved" };
    const result = applyKeysFile(keysFile("ANTHROPIC_API_KEY=sk-stray\nPATH=/tmp\nOMB_USER_DATA=/tmp\nBOX_TOKEN=\n"), env);
    expect(result?.loaded).toEqual([]);
    expect(result?.ignored.sort()).toEqual(["ANTHROPIC_API_KEY", "OMB_USER_DATA", "PATH"]);
    expect(env).toEqual({ BOX_TOKEN: "boat_saved" });
  });

  it("skips malformed lines and keeps the valid ones", () => {
    const env: NodeJS.ProcessEnv = {};
    expect(applyKeysFile(keysFile("not a pair\n=novalue\nOMB_OPENAI_API_KEY=sk-ok\n"), env)?.loaded).toEqual(["OMB_OPENAI_API_KEY"]);
    expect(env).toEqual({ OMB_OPENAI_API_KEY: "sk-ok" });
  });

  it("returns null without a file", () => {
    const env: NodeJS.ProcessEnv = {};
    expect(applyKeysFile(join(mkdtempSync(join(tmpdir(), "omb-keys-")), ".env"), env)).toBeNull();
    expect(env).toEqual({});
  });
});
