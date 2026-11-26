// Imported right after cloud-secrets-boot, before any module that reads a key from the environment.
import { join } from "node:path";

import { defaultDataDir } from "./data-dir.ts";
import { applyKeysFile } from "./keys-file.ts";

const file = join(defaultDataDir(), ".env");
const result = applyKeysFile(file);
if (result) {
  console.log(`keys: ${result.loaded.length} from ${file}${result.loaded.length ? ` (${result.loaded.join(", ")})` : ""}`);
  if (result.ignored.length) console.warn(`keys: ignored in ${file}, not a key OpenMausBot reads: ${result.ignored.join(", ")}`);
}
