# Synapse Authentication Email System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade all Synapse authentication pages and route both sign-up confirmation and password-reset emails through the Render FastAPI backend with Supabase-generated one-time links and Synapse SMTP branding.

**Architecture:** The browser uses only Supabase's public URL/key and the Render backend URL. The Render backend uses the Supabase service-role key to generate signup, invite/resend, and recovery action links, then sends the HTML/plain-text messages through SMTP. Supabase remains responsible for account state, token validation, sessions, and password updates; Vercel hosts the verification and reset pages.

**Tech Stack:** Static HTML/CSS/JavaScript, FastAPI/Python, Supabase Auth REST admin endpoints, Python `smtplib`, Render Blueprint, Vercel static build, Node regression scripts, Python `unittest`.

## Global Constraints

- Never expose `SUPABASE_SERVICE_ROLE_KEY`, SMTP username, or SMTP password to the frontend.
- Production redirect hosts are restricted to `https://synapse-ai-study-assistant-tutor.vercel.app` and the exact `verify.html`/`reset-password.html` paths.
- Recovery and confirmation requests return generic success messages that do not reveal whether an email has an account.
- Supabase remains the identity provider; the frontend continues to consume one-time Supabase sessions for verification and password updates.
- Auth pages use the existing Synapse visual language and remain responsive at desktop and mobile widths.
- No new runtime dependency is required; SMTP uses Python's standard library.

---

### Task 1: Replace Supabase Default Signup Email With Synapse Delivery

**Files:**
- Modify: `backend/app.py:702-760, 930-1030`
- Test: `backend/tests/test_auth_signup_api.py`

**Interfaces:**
- Consumes: `SUPABASE_SERVICE_ROLE_KEY`, `SYNAPSE_FRONTEND_BASE_URL`, SMTP settings, and the existing `validate_signup_payload()`/`existing_account_response()` helpers.
- Produces: `call_supabase_generate_signup_link(clean_payload, redirect_to) -> tuple[action_link, user, error, status]`; `/api/auth/signup` sends the confirmation email from Synapse and returns `created_confirmation_sent`.

- [ ] **Step 1: Write failing tests for custom signup email delivery.**

Add tests that patch `requests.post` and `send_synapse_auth_email` and assert:

```python
response = self.client.post("/api/auth/signup", json=signup_payload())
assert response.status_code == 200
assert response.json()["state"] == "created_confirmation_sent"
assert generated_request["json"]["type"] == "signup"
assert generated_request["json"]["redirect_to"].endswith("/frontend/verify.html")
send_email.assert_called_once()
```

Also add a configuration test asserting that missing SMTP settings returns `503` with state `email_not_configured`, and a failure test asserting that the email provider error never exposes the private provider response body.

- [ ] **Step 2: Run the signup tests and verify the new expectations fail.**

Run:

```bash
./.venv/bin/python -m unittest backend.tests.test_auth_signup_api -v
```

Expected result: the new custom-email assertions fail because signup currently calls `/auth/v1/signup` and allows Supabase's default mailer to send the confirmation message.

- [ ] **Step 3: Add the Supabase signup action-link helper.**

Implement a helper that calls:

```python
requests.post(
    f"{SUPABASE_URL}/auth/v1/admin/generate_link",
    headers=supabase_admin_headers(),
    json={
        "type": "signup",
        "email": clean_payload["email"],
        "password": clean_payload["password"],
        "data": {
            "first_name": clean_payload["first_name"],
            "last_name": clean_payload["last_name"],
            "role": clean_payload["role"],
            "plan": "free",
            "credits": 500,
        },
        "redirect_to": redirect_to,
    },
    timeout=18,
)
```

Return the response `action_link` and user payload on success. Return a sanitized error tuple on non-2xx responses. The service-role header must be created only inside the backend.

- [ ] **Step 4: Route signup through custom email delivery.**

Require both Supabase admin configuration and Synapse SMTP configuration before generating a link. Call the new helper, then call the shared mailer with subject `Confirm your Synapse account`, the verification link, and the user's normalized email. Preserve duplicate-account detection and field validation. Return the existing `created_confirmation_sent` response only after both link generation and SMTP delivery succeed.

- [ ] **Step 5: Run the signup tests and verify they pass.**

Run:

```bash
./.venv/bin/python -m unittest backend.tests.test_auth_signup_api -v
```

Expected result: all signup, duplicate-account, validation, custom-link, and delivery-error tests pass.

- [ ] **Step 6: Commit the backend signup change.**

```bash
git add backend/app.py backend/tests/test_auth_signup_api.py
git commit -m "Send signup confirmation emails from Synapse"
```

### Task 2: Move Confirmation Resends to Synapse

**Files:**
- Modify: `backend/app.py:1040-1105`
- Modify: `frontend/auth-client.js:345-365`
- Test: `backend/tests/test_auth_signup_api.py`

**Interfaces:**
- Consumes: pending Supabase user records and the same SMTP mailer from Task 1.
- Produces: `/api/auth/resend-confirmation` that generates a Supabase `invite`/confirmation action link and sends it through Synapse.

- [ ] **Step 1: Write failing resend tests.**

Assert that a pending account causes an admin `generate_link` request with `type: "invite"`, the public verification redirect, and one Synapse confirmation message. Assert that a confirmed account still returns the existing login action without sending email.

- [ ] **Step 2: Run the resend tests and verify they fail against the current `/auth/v1/resend` implementation.**

```bash
./.venv/bin/python -m unittest backend.tests.test_auth_signup_api.AuthSignupApiTests.test_resend_confirmation_for_pending_account -v
```

Expected result: the assertion fails because the current route posts to `/auth/v1/resend`, which uses Supabase's mailer.

- [ ] **Step 3: Replace the Supabase resend call with custom action-link generation and Synapse delivery.**

Use the pending user's email and the verified production redirect. Keep the generic user-facing message and masked logging. If Supabase returns an unavailable-account response, preserve the safe existing response; if SMTP fails, return a sanitized `502` delivery error.

- [ ] **Step 4: Run all auth backend tests.**

```bash
./.venv/bin/python -m unittest backend.tests.test_auth_signup_api -v
```

Expected result: all tests pass.

- [ ] **Step 5: Commit the resend change.**

```bash
git add backend/app.py backend/tests/test_auth_signup_api.py frontend/auth-client.js
git commit -m "Send confirmation resends from Synapse"
```

### Task 3: Build the High-Quality Unified Auth UI

**Files:**
- Modify: `frontend/landing-auth.css`
- Modify: `frontend/login.html`
- Modify: `frontend/signup.html`
- Modify: `frontend/forgot-password.html`
- Modify: `frontend/reset-password.html`
- Modify: `frontend/verify.html`
- Modify: `frontend/landing-auth.js`
- Modify: `frontend/reset-password.js`
- Modify: `frontend/verify-auth.js`
- Test: `frontend/tests/auth-routing-regression.mjs`

**Interfaces:**
- Consumes: `window.SynapseAuth.signUpEmail`, `resendSignupConfirmation`, `resetPassword`, `preparePasswordRecovery`, and `updatePassword`.
- Produces: consistent responsive auth pages with stable test IDs, accessible status regions, and clear user state transitions.

- [ ] **Step 1: Add failing DOM/regression assertions.**

Extend `frontend/tests/auth-routing-regression.mjs` to require:

```javascript
assert.ok(signupPage.includes("password-strength"));
assert.ok(signupPage.includes("password-requirements"));
assert.ok(loginPage.includes("data-testid=\"login-status\""));
assert.ok(forgotPage.includes("data-testid=\"reset-success\""));
assert.ok(resetPage.includes("data-testid=\"reset-password-success\""));
assert.ok(verifyPage.includes("data-testid=\"verify-status\""));
```

- [ ] **Step 2: Run the frontend regression and verify the new assertions fail.**

```bash
./.synapse_runtime/node/current/bin/node frontend/tests/auth-routing-regression.mjs
```

Expected result: the new selectors fail because the pages do not yet expose all shared high-quality state surfaces.

- [ ] **Step 3: Implement the shared visual system.**

Update `landing-auth.css` with a consistent auth shell, responsive form grid, restrained blue/indigo Synapse accents, visible focus states, compact status panels, password requirement rows, strength meter, and mobile-safe spacing. Keep cards at the existing compact radius and preserve the current logo assets.

- [ ] **Step 4: Improve login and sign-up pages.**

Add shared status regions, clear account-recovery links, password strength feedback, requirements that change state as the user types, confirmation matching, show/hide controls, and disabled/loading button states. Keep all field errors in text nodes and associate them with `aria-describedby`.

- [ ] **Step 5: Improve forgot-password, reset-password, and verification pages.**

Add a branded “secure account recovery” framing, generic email-sent confirmation, resend/retry links, expired/reused-link handling, and clear success navigation. Keep the reset flow connected to Supabase's recovery session and keep the verification flow connected to Supabase's confirmation callback.

- [ ] **Step 6: Run the frontend auth regression.**

```bash
./.synapse_runtime/node/current/bin/node frontend/tests/auth-routing-regression.mjs
./.synapse_runtime/node/current/bin/node scripts/validate_static_site.mjs
```

Expected result: both commands pass.

- [ ] **Step 7: Commit the auth UI change.**

```bash
git add frontend/landing-auth.css frontend/login.html frontend/signup.html frontend/forgot-password.html frontend/reset-password.html frontend/verify.html frontend/landing-auth.js frontend/reset-password.js frontend/verify-auth.js frontend/tests/auth-routing-regression.mjs
git commit -m "Polish Synapse authentication experience"
```

### Task 4: Production Configuration and Deployment Verification

**Files:**
- Modify: `render.yaml`
- Modify: `backend/.env.example`
- Modify: `README.md`
- Test: `backend/tests/test_health_probe.py`

**Interfaces:**
- Consumes: the SMTP provider's verified sender and credentials supplied by the user in Render.
- Produces: a Blueprint that declares all backend-only auth email variables without storing their values in Git.

- [ ] **Step 1: Add health visibility for auth email configuration.**

Expose only booleans from `/health`, such as `supabase_auth_configured` and `synapse_email_delivery_configured`; never expose keys, email passwords, or SMTP host credentials in health output. Add tests for configured and missing states.

- [ ] **Step 2: Verify the Render Blueprint declares these backend variables.**

The `synapse-ai-backend` service must declare:

```text
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
SYNAPSE_FRONTEND_BASE_URL
SYNAPSE_SMTP_HOST
SYNAPSE_SMTP_PORT
SYNAPSE_SMTP_SECURITY
SYNAPSE_SMTP_USERNAME
SYNAPSE_SMTP_PASSWORD
SYNAPSE_SMTP_FROM_EMAIL
SYNAPSE_SMTP_FROM_NAME
```

The `synapse-data-api` service must keep its existing Supabase and internal-token variables; it does not need SMTP variables.

- [ ] **Step 3: Update setup documentation with exact dashboard actions.**

Document that Supabase needs email/password auth, email confirmation, the production site URL, and exact verification/reset redirect URLs. Document that Render values are entered under `synapse-ai-backend`, and that SMTP credentials are never entered in Vercel or frontend files.

- [ ] **Step 4: Run the complete local verification suite.**

```bash
./.venv/bin/python -m unittest backend.tests.test_auth_signup_api backend.tests.test_health_probe
./.synapse_runtime/node/current/bin/node frontend/tests/auth-routing-regression.mjs
./.synapse_runtime/node/current/bin/node frontend/tests/supabase-email-template-regression.mjs
./.synapse_runtime/node/current/bin/node scripts/validate_static_site.mjs
PATH=/Users/zhenghui/Desktop/Synapse-ai-study-assistant/.synapse_runtime/node/current/bin:$PATH /Users/zhenghui/Desktop/Synapse-ai-study-assistant/.synapse_runtime/node/current/bin/npm run build
```

Expected result: all tests pass and Vite produces `dist/frontend/login.html`, `signup.html`, `forgot-password.html`, `reset-password.html`, and `verify.html`.

- [ ] **Step 5: Commit and push deployment configuration.**

```bash
git add render.yaml backend/.env.example README.md backend/tests/test_health_probe.py
git commit -m "Verify production auth email configuration"
git push origin main
```

- [ ] **Step 6: Complete dashboard configuration and production smoke test.**

In Supabase, set the production Site URL and redirect allowlist. In Render, enter the SMTP values on `synapse-ai-backend`, deploy the latest commit, and wait for Live. Then test a new sign-up email and a new reset email from the public Vercel URLs. Do not reuse old localhost links.

### Cleanup Decision

Do not delete every Markdown file automatically. The repository contains required README and setup documentation. After implementation, delete only the new spec and plan files unless the user explicitly confirms that every repository Markdown file, including README and existing documentation, should be removed.

