// The World Herald — news-image-20261123 round 3.
//
// Round-3 entry: a one-page tabloid front page for Monday 23 November 2026.
// Lead story: "UKRAINE SINKS RUSSIAN WARSHIP OFF LIBYA" — Ukraine says sea
// drones sank the Russian corvette Merkury off Benghazi, in a strike that
// also hit the cargo ship MV Angara; the first reported sinking of a Russian
// warship in the Mediterranean. Second story: markets tumble on AI fears
// (Nikkei -5.1%, S&P 500 -3.7%, gold +2.7%), plus an ALSO TODAY strip with
// six more stories (COP31 collapse, Iran hits Bahrain, Dymer toll 11,
// 'El Chapo Isidro' captured, Java fire 24 dead, Democrats take 258 seats).
//
// Determinism guarantee: this script does NOT re-render anything. It copies
// the checked-in entry.png byte-for-byte to the output directory, so the
// delivered image is identical on every run, on any machine. Verification is
// twofold — byte length AND sha256 of the copy must match the source — and
// the source must first pass a PNG magic-bytes check, so a truncated or
// non-PNG source fails loudly instead of being shipped. No network,
// no randomness, no timestamps in the output.
import * as fs from "node:fs";
import * as path from "node:path";
import * as crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(here, "entry.png");
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const dest = path.join(outDir, "entry.png");

const data = fs.readFileSync(src);
// Reject a truncated or non-PNG source before anything is written out:
// a valid PNG always starts with these 8 magic bytes.
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
if (data.length < PNG_MAGIC.length || !data.subarray(0, 8).equals(PNG_MAGIC)) {
  throw new Error(
    `source is not a valid PNG (got ${data.length} bytes, bad or missing PNG magic)`,
  );
}
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(dest, data);

const copied = fs.readFileSync(dest);
if (copied.length !== data.length) {
  throw new Error(
    `size mismatch: source ${data.length} bytes, copy ${copied.length} bytes`,
  );
}
const srcHash = crypto.createHash("sha256").update(data).digest("hex");
const dstHash = crypto.createHash("sha256").update(copied).digest("hex");
if (srcHash !== dstHash) {
  throw new Error(`sha256 mismatch: source ${srcHash}, copy ${dstHash}`);
}
console.log(`copied entry.png (${data.length} bytes, sha256 ${srcHash}) to ${dest}`);
