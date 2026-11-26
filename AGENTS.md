# OpenMausBot agent notes

Before claiming a server or conversation change works, follow
[`docs/verification/README.md`](docs/verification/README.md). Always launch an
isolated fixture; never verify mutations against the user's live app or data.

UI changes follow [`DESIGN.md`](DESIGN.md).

## Comments

Write a comment only for what the code cannot say:

- a license or attribution notice;
- a fact forced by something outside this code (a vendor, CLI, OS, browser,
  Electron or protocol behaviour), with its version when it has one;
- the doc comment of a public contract: the wire types in `shared/`, the
  driver interface, the preload bridge, `config.json` fields people edit;
- a link to an upstream issue;
- a security invariant or a known open risk.

Do not narrate what the next line does, restate a name, record history ("used
to", "no longer", PR or issue numbers, plan or slice names: git has it), point
at other files, draw banners or leave commented-out code. When our own code
needs a paragraph to explain a surprise, change the code instead: a better
name, a type, an extracted function, one shared helper. A rule ("never X",
"must match Y") belongs in a type, a test or a lint rule. Never suppress a lint
rule that guards correctness; fix the code.

## This fork

This checkout is `syang36-c/mausbot-personal`, a personal fork that no longer
follows upstream (there is no upstream remote). Its owner deploys and uses it
alone: their own server and their own packaged desktop build, not upstream's
releases, services or MausBot Cloud.

- Every key comes from the owner, in `.env` in the data folder
  (`~/.openmausbot/.env` by default). The server applies it at start
  (`server/keys-file.ts`): only the names in `server/credential-env.ts`, over
  the environment and `config.json`. Keys saved in Settings still work, but a
  key in `.env` wins.
- No upstream service is reached by default. There is no default
  connected-apps broker (`OMB_COMPOSIO_BROKER_URL`) or companion control plane
  (`OMB_CONTROL_PLANE_URL`): connected apps use the owner's Composio project
  key, and phones reach the server over Tailscale, the LAN or the owner's own
  proxy. Usage analytics are gone: `track()` records nothing. Updates, the
  update check, announcements, release notes and the model list read this
  fork; the team library reads `syang36-c/openmausbot-teams`, and the Windows
  browser engine downloads from this fork's `browser-engine-v*` release.
- MausBot Cloud is off: `cloudOffersAllowed()` is false and the desktop's Cloud
  client gets a fetch that refuses every request; `organization:begin` refuses
  an `openmausbot.com` portal. Bug reports go nowhere unless
  `OMB_BUG_REPORT_URL` is set.
- `scripts/testing/no-upstream-hosts.test.ts` fails when a runtime file names
  an upstream host; a file that must name one is listed there with why.
- The owner's keys never reach a fixture or a test: the verification launcher
  gives its child a temporary data folder and passes only `FAKE_CLAUDE_*`
  through.
- Never stop or take over another project's processes or ports without asking;
  check what holds a port before using it.

More specific `AGENTS.md` files override this note within their directories.
