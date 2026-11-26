import { afterEach, describe, expect, it, vi } from "vitest";

import { cloudAccountBridge } from "./cloud-add-web";

afterEach(() => vi.unstubAllGlobals());

describe("Add a Cloud", () => {
  it("only the desktop's own page has the sign-in Add a Cloud runs on", () => {
    const cloudAccount = { state: vi.fn() };
    vi.stubGlobal("window", {});
    expect(cloudAccountBridge()).toBeUndefined();
    vi.stubGlobal("window", { ogb: { cloudAccount, remoteClient: { active: true } } });
    expect(cloudAccountBridge()).toBeUndefined();
    vi.stubGlobal("window", { ogb: { cloudAccount, remoteClient: { active: false } } });
    expect(cloudAccountBridge()).toBe(cloudAccount);
  });
});
