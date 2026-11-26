// @vitest-environment happy-dom
import { createElement } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { initialState, type Action, type AppState } from "./state/store";

let state: AppState = { ...initialState, connected: true, hydrated: true };
let dispatched: Action[] = [];
vi.mock("./state/store", async (original) => ({
  ...await original<typeof import("./state/store")>(),
  StoreProvider: ({ children }: { children: unknown }) => children,
  useStore: () => ({ state, dispatch: (action: Action) => { dispatched.push(action); }, flushBotPatches: async () => null, refreshInstances: async () => {}, refreshModels: async () => {} }),
}));
vi.mock("./lib/analytics", () => ({ initAnalytics: () => {}, track: () => {}, emailGateDone: () => true }));
const { default: App } = await import("./App");

function render(cloudAdd: AppState["cloudAdd"], ogb?: unknown): { opened: ReturnType<typeof vi.fn>; done: () => void } {
  vi.stubGlobal("fetch", () => new Promise(() => {}));
  const opened = vi.fn(() => null);
  vi.stubGlobal("open", opened);
  if (ogb) (window as { ogb?: unknown }).ogb = ogb;
  state = { ...initialState, connected: true, hydrated: true, cloudAdd };
  dispatched = [];
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  flushSync(() => root.render(createElement(App)));
  return { opened, done: () => { root.unmount(); container.remove(); } };
}

afterEach(() => { delete (window as { ogb?: unknown }).ogb; vi.unstubAllGlobals(); });

it("without the desktop's own Cloud sign-in, a request to add a Cloud opens nothing and leaves nothing waiting", () => {
  for (const ogb of [undefined, { remoteClient: { active: true }, cloudAccount: {}, openExternal: vi.fn(async () => {}) }]) {
    const { opened, done } = render({ source: "app_onboarding" }, ogb);
    try {
      expect(opened).not.toHaveBeenCalled();
      expect(dispatched).toContainEqual({ type: "closeCloudAdd" });
    } finally { done(); }
  }
});

it("on the desktop's own page the Add a Cloud dialog takes it, as before", () => {
  const openExternal = vi.fn(async () => {});
  const { opened, done } = render({ source: "app_onboarding" }, { cloudAccount: {}, openExternal });
  try {
    expect(opened).not.toHaveBeenCalled();
    expect(openExternal).not.toHaveBeenCalled();
    expect(dispatched).not.toContainEqual({ type: "closeCloudAdd" });
  } finally { done(); }
});
