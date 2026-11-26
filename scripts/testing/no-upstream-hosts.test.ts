// This fork reaches none of upstream's services: no runtime file may name one, outside the few listed below.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const ROOT = new URL("../../", import.meta.url);
const UPSTREAM = /openmausbot\.com|milind-?soni|omb-cloud-staging\.fly\.dev/i;
// connector/ is MausBot Cloud's runner for a customer's own server: it is not part of the app this fork builds.
const RUNTIME = /^(?:src|server|shared|electron|companion|packages\/[^/]+\/src)\//;
const NOT_RUNTIME = /\.test\.|\.node-test\.|\.e2e\.|\/testing\/|\/fixtures\/|\/e2e\/|^src\/locales\/|^electron\/vendor\/|-preview\.tsx$|\.d\.m?ts$/;

/** Files that name an upstream host without contacting it, each with why. */
const ALLOWED: Record<string, string> = {
  "electron/cloud-account.mjs": "the upstream Admins' addresses; main gives this client a fetch that refuses every request",
  "electron/main.mjs": "organization:begin refuses an openmausbot.com portal",
  "electron/launch-probes.mjs": "sorts request hosts into kinds; sends nothing",
  "src/lib/launch-marks.ts": "sorts request hosts into kinds; sends nothing",
  "electron/desktop-companion-client.mjs": "the zones a control plane's phone address may sit in; there is no default control plane",
  "server/tool-schema-profile.ts": "a comment citing an upstream issue",
  "server/webhooks.ts": "a comment linking an upstream issue",
  "src/lib/app-links.ts": "Cloud plan pages, linked only on a MausBot Cloud server, from a Cloud sign-in main refuses, or from popups gated on cloudOffersAllowed (false)",
  "src/lib/whats-new.ts": "the What's new and Teams Cloud slides, shown only where main says it sells Cloud (cloudOffersAllowed, false)",
  "src/components/CloudCancelPlan.tsx": "cancelling a paid Cloud plan, which needs a Cloud sign-in main refuses",
  "src/lib/onboarding.ts": "the default organization portal, which main refuses at organization:begin",
  "src/components/OrganizationSettings.tsx": "the default organization portal, which main refuses at organization:begin",
};

function runtimeFiles(): string[] {
  return execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard"], { cwd: ROOT, encoding: "utf8" })
    .split("\n")
    .filter((file) => RUNTIME.test(file) && !NOT_RUNTIME.test(file) && /\.(?:[cm]?[jt]sx?|json)$/.test(file));
}

describe("upstream hosts", () => {
  it("are named only where a file says why", () => {
    const naming = runtimeFiles().filter((file) => UPSTREAM.test(readFileSync(new URL(file, ROOT), "utf8")));
    expect(naming.filter((file) => !Object.hasOwn(ALLOWED, file))).toEqual([]);
    expect(Object.keys(ALLOWED).filter((file) => !naming.includes(file)), "an allowed file no longer names one: drop it").toEqual([]);
  });
});
