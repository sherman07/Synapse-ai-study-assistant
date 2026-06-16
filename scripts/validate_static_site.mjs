import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const frontendRoot = path.join(repoRoot, "frontend");

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function readTreeText(dir) {
  if (!fs.existsSync(dir)) return "";
  return fs.readdirSync(dir, { withFileTypes: true }).map(entry => {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return readTreeText(entryPath);
    if (!/\.(js|jsx|css)$/.test(entry.name)) return "";
    return read(entryPath);
  }).join("\n");
}

function htmlFiles() {
  return fs.readdirSync(frontendRoot)
    .filter(file => file.endsWith(".html"))
    .map(file => path.join(frontendRoot, file));
}

function resolveInternalTarget(fromFile, href) {
  const clean = href.split("?")[0];
  const [filePart, hash = ""] = clean.split("#");
  if (!filePart) {
    return { file: fromFile, hash };
  }
  if (filePart.startsWith("/logos/")) {
    return { file: path.join(frontendRoot, filePart), hash };
  }
  if (filePart.startsWith("/")) {
    return { file: path.join(repoRoot, filePart), hash };
  }
  return { file: path.resolve(path.dirname(fromFile), filePart), hash };
}

function hasAnchor(html, hash) {
  if (!hash) return true;
  const decoded = decodeURIComponent(hash);
  return html.includes(`id="${decoded}"`) || html.includes(`name="${decoded}"`);
}

function anchorSourceFor(filePath) {
  const html = read(filePath);
  if (path.resolve(filePath) !== path.join(frontendRoot, "landing.html")) return html;
  return `${html}\n${readTreeText(path.join(frontendRoot, "src", "landing"))}`;
}

for (const filePath of htmlFiles()) {
  const html = read(filePath);
  const name = path.relative(repoRoot, filePath);

  assert.match(html, /<title>[^<]{4,}<\/title>/, `${name} needs a meaningful title`);
  assert.match(html, /<meta\s+name="description"\s+content="[^"]{30,}"/, `${name} needs a meta description`);
  assert.doesNotMatch(html, /href=["']#["']/, `${name} contains a placeholder link`);
  assert.doesNotMatch(html, /<button(?![^>]*\btype=)/, `${name} has a button without an explicit type`);

  if (!name.endsWith("index.html")) {
    assert.equal((html.match(/<h1\b/gi) || []).length, 1, `${name} should have exactly one h1`);
  }

  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    assert.match(match[0], /\balt=["'][^"']*["']/, `${name} has an image without alt text: ${match[0]}`);
  }

  for (const match of html.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["']/gi)) {
    const href = match[1].trim();
    assert.ok(href, `${name} has an empty link`);
    if (/^(https?:|mailto:|tel:)/i.test(href)) continue;
    const { file, hash } = resolveInternalTarget(filePath, href);
    assert.ok(fs.existsSync(file), `${name} links to missing file: ${href}`);
    if (hash) {
      assert.ok(hasAnchor(anchorSourceFor(file), hash), `${name} links to missing anchor: ${href}`);
    }
  }
}

const landing = read(path.join(frontendRoot, "landing.html"));
const landingSource = readTreeText(path.join(frontendRoot, "src", "landing"));
for (const requiredId of ["product", "features", "how-it-works", "about", "pricing", "contact", "contactForm", "authModal"]) {
  assert.ok(
    landing.includes(`id="${requiredId}"`) || landingSource.includes(`id="${requiredId}"`),
    `landing page is missing #${requiredId}`
  );
}

assert.ok(fs.existsSync(path.join(frontendRoot, "logos", "synapse.png")), "frontend publish directory needs synapse.png");
assert.ok(fs.existsSync(path.join(frontendRoot, "logos", "synapse_no_spark.png")), "frontend publish directory needs synapse_no_spark.png");
assert.ok(read(path.join(repoRoot, "index.html")).includes("frontend/landing.html"), "project root should open the public landing page");

console.log("static launch validation passed");
