import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const authScript = fs.readFileSync(path.join(repoRoot, "frontend/landing-auth.js"), "utf8");
const accountsKey = "synapse.auth.accounts.v1";
const sessionKey = "synapse.auth.session.v1";

assert.ok(authScript.includes("function appEntryUrl()"));
assert.ok(authScript.includes(accountsKey));
assert.ok(authScript.includes(sessionKey));
assert.ok(!authScript.includes("window.location.href = '/index.html'"));
assert.ok(!authScript.includes("window.prompt"), "Google auth must not use a fake prompt-based login fallback");
assert.ok(authScript.includes("signInWithGoogle"), "Google auth should delegate to the real auth provider");
assert.ok(fs.existsSync(path.join(repoRoot, "index.html")));

const rootIndex = fs.readFileSync(path.join(repoRoot, "index.html"), "utf8");
assert.ok(rootIndex.includes("frontend/landing.html"));
const rootApp = fs.readFileSync(path.join(repoRoot, "app.html"), "utf8");
assert.ok(rootApp.includes("frontend/index.html"));

for (const page of ["landing", "login", "signup", "forgot-password"]) {
  const shim = fs.readFileSync(path.join(repoRoot, `${page}.html`), "utf8");
  assert.ok(shim.includes(`frontend/${page}.html`), `${page}.html should redirect to frontend/${page}.html`);
}

function makeClassList() {
  const values = new Set();
  return {
    add(name) {
      values.add(name);
    },
    remove(name) {
      values.delete(name);
    },
    toggle(name, force) {
      const shouldAdd = force === undefined ? !values.has(name) : Boolean(force);
      if (shouldAdd) values.add(name);
      else values.delete(name);
      return shouldAdd;
    },
    contains(name) {
      return values.has(name);
    }
  };
}

function makeElement(value = "") {
  return {
    value,
    checked: false,
    disabled: false,
    textContent: "",
    type: "password",
    style: {
      setProperty() {}
    },
    classList: makeClassList(),
    addEventListener() {},
    getBoundingClientRect() {
      return { left: 0, top: 0, width: 100, height: 100 };
    },
    querySelector() {
      return null;
    },
    scrollIntoView() {}
  };
}

function makeLocalStorage(seed = {}) {
  const values = new Map(Object.entries(seed));
  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    },
    removeItem(key) {
      values.delete(key);
    },
    clear() {
      values.clear();
    }
  };
}

function simulateAuthSubmit({ pathname, page, store, values = {} }) {
  let submitHandler = null;
  const submitButton = makeElement();
  const errors = {
    emailError: makeElement(),
    passwordError: makeElement(),
    firstNameError: makeElement(),
    lastNameError: makeElement(),
    signupEmailError: makeElement(),
    signupPasswordError: makeElement(),
    confirmPasswordError: makeElement(),
    termsError: makeElement(),
    resetEmailError: makeElement()
  };
  const termsCheckbox = makeElement();
  termsCheckbox.checked = values.termsChecked ?? true;
  const loginForm = {
    addEventListener(type, handler) {
      if (type === "submit") submitHandler = handler;
    },
    querySelector(selector) {
      return selector === 'button[type="submit"]' ? submitButton : null;
    }
  };
  const signupForm = {
    addEventListener(type, handler) {
      if (type === "submit") submitHandler = handler;
    },
    querySelector(selector) {
      if (selector === 'button[type="submit"]') return submitButton;
      if (selector === 'input[name="terms"]') return termsCheckbox;
      return null;
    }
  };
  const forgotPasswordForm = {
    addEventListener(type, handler) {
      if (type === "submit") submitHandler = handler;
    },
    querySelector(selector) {
      return selector === 'button[type="submit"]' ? submitButton : null;
    }
  };
  const elements = {
    ...errors,
    loginForm: page === "login" ? loginForm : null,
    loginEmail: makeElement(values.email || "student@example.com"),
    loginPassword: makeElement(values.password || "password123"),
    loginSpinner: makeElement(),
    togglePassword: null,
    signupForm: page === "signup" ? signupForm : null,
    firstName: makeElement(values.firstName || "Sherman"),
    lastName: makeElement(values.lastName || "Zheng"),
    signupEmail: makeElement(values.email || "student@example.com"),
    role: makeElement(values.role || "student"),
    signupPassword: makeElement(values.password || "password123"),
    confirmPassword: makeElement(values.confirmPassword || values.password || "password123"),
    signupSpinner: makeElement(),
    toggleSignupPassword: null,
    toggleConfirmPassword: null,
    forgotPasswordForm: page === "forgot" ? forgotPasswordForm : null,
    resetEmail: makeElement(values.email || "student@example.com"),
    resetSpinner: makeElement(),
    resetSuccess: makeElement(),
    mobileToggle: null
  };
  const windowStub = {
    location: { pathname, href: "" },
    localStorage: store,
    prompt() {
      return values.promptValue || "";
    }
  };
  const documentStub = {
    body: { style: {} },
    addEventListener() {},
    getElementById(id) {
      return elements[id] || null;
    },
    querySelector() {
      return null;
    },
    querySelectorAll(selector) {
      if (selector === ".auth-error") return Object.values(errors);
      return [];
    }
  };
  const context = vm.createContext({
    Date,
    JSON,
    Math,
    window: windowStub,
    document: documentStub,
    console: { log() {}, warn() {} },
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
  return { href: windowStub.location.href, elements, store };
}

const store = makeLocalStorage();
const signup = simulateAuthSubmit({ pathname: "/frontend/signup.html", page: "signup", store });
assert.equal(signup.href, "index.html");

const accounts = JSON.parse(store.getItem(accountsKey));
assert.equal(accounts.length, 1);
assert.equal(accounts[0].email, "student@example.com");
assert.equal(accounts[0].firstName, "Sherman");
assert.equal(accounts[0].plan, "Starter");
assert.equal(accounts[0].credits, 500);
assert.ok(!("passwordHash" in accounts[0]));
assert.ok(!("password" in accounts[0]));
assert.equal(accounts[0].authMode, "local_demo");
assert.ok(store.getItem(sessionKey));

store.removeItem(sessionKey);
const loginFromFrontend = simulateAuthSubmit({ pathname: "/frontend/login.html", page: "login", store });
assert.equal(loginFromFrontend.href, "index.html");
assert.ok(JSON.parse(store.getItem(sessionKey)).email);

store.removeItem(sessionKey);
const loginFromRoot = simulateAuthSubmit({ pathname: "/login.html", page: "login", store });
assert.equal(loginFromRoot.href, "frontend/index.html");

const missingAccountStore = makeLocalStorage();
const missingAccount = simulateAuthSubmit({ pathname: "/frontend/login.html", page: "login", store: missingAccountStore });
assert.equal(missingAccount.href, "");
assert.ok(missingAccount.elements.emailError.classList.contains("show"));

const legacyStore = makeLocalStorage({
  [accountsKey]: JSON.stringify([{
    id: "legacy",
    email: "legacy@example.com",
    firstName: "Legacy",
    lastName: "Student",
    authProvider: "email",
    passwordHash: "old-local-verifier",
    plan: "Starter",
    credits: 500
  }])
});
const legacyLogin = simulateAuthSubmit({
  pathname: "/frontend/login.html",
  page: "login",
  store: legacyStore,
  values: { email: "legacy@example.com", password: "anything-non-empty" }
});
assert.equal(legacyLogin.href, "index.html");
const migratedAccounts = JSON.parse(legacyStore.getItem(accountsKey));
assert.ok(!("passwordHash" in migratedAccounts[0]));
assert.equal(migratedAccounts[0].authMode, "local_demo");

console.log("auth routing regression passed");
