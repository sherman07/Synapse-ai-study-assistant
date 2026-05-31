import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const authScript = fs.readFileSync(path.join(repoRoot, "frontend/landing-auth.js"), "utf8");

assert.ok(authScript.includes("function appEntryUrl()"));
assert.ok(!authScript.includes("window.location.href = '/index.html'"));
assert.ok(fs.existsSync(path.join(repoRoot, "index.html")));

const rootIndex = fs.readFileSync(path.join(repoRoot, "index.html"), "utf8");
assert.ok(rootIndex.includes("frontend/index.html"));

for (const page of ["landing", "login", "signup", "forgot-password"]) {
  const shim = fs.readFileSync(path.join(repoRoot, `${page}.html`), "utf8");
  assert.ok(shim.includes(`frontend/${page}.html`), `${page}.html should redirect to frontend/${page}.html`);
}

function simulateLoginRedirect(pathname) {
  let submitHandler = null;
  const classList = { add() {}, remove() {}, toggle() {} };
  const submitButton = { classList, disabled: false };
  const elements = {
    loginForm: {
      addEventListener(type, handler) {
        if (type === "submit") submitHandler = handler;
      },
      querySelector() {
        return submitButton;
      }
    },
    loginEmail: { value: "student@example.com" },
    loginPassword: { value: "password123" },
    loginSpinner: { classList },
    togglePassword: null
  };
  const windowStub = { location: { pathname, href: "" } };
  const documentStub = {
    body: { style: {} },
    addEventListener() {},
    getElementById(id) {
      return elements[id] || null;
    },
    querySelectorAll() {
      return [];
    }
  };
  const context = vm.createContext({
    window: windowStub,
    document: documentStub,
    console: { log() {} },
    alert() {},
    setTimeout(callback) {
      callback();
    },
    IntersectionObserver: function IntersectionObserver() {
      this.observe = () => {};
    }
  });
  vm.runInContext(authScript, context);
  assert.equal(typeof submitHandler, "function");
  submitHandler({ preventDefault() {} });
  return windowStub.location.href;
}

assert.equal(simulateLoginRedirect("/frontend/login.html"), "index.html");
assert.equal(simulateLoginRedirect("/login.html"), "frontend/index.html");

console.log("auth routing regression passed");
