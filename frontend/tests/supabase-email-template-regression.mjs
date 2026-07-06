import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const templatePath = path.join(repoRoot, "supabase/auth-email-templates/confirm-signup.html");
const resetTemplatePath = path.join(repoRoot, "supabase/auth-email-templates/reset-password.html");
const readmePath = path.join(repoRoot, "supabase/auth-email-templates/README.md");

assert.ok(fs.existsSync(templatePath), "Synapse confirm-signup email template should exist");
assert.ok(fs.existsSync(resetTemplatePath), "Synapse reset-password email template should exist");
assert.ok(fs.existsSync(readmePath), "Synapse email template setup guide should exist");

const template = fs.readFileSync(templatePath, "utf8");
const resetTemplate = fs.readFileSync(resetTemplatePath, "utf8");
const readme = fs.readFileSync(readmePath, "utf8");

assert.ok(template.includes("Synapse"), "Email body should be branded as Synapse");
assert.ok(template.includes("{{ .ConfirmationURL }}"), "Template must preserve Supabase confirmation URL variable");
assert.ok(template.includes("Confirm email address"), "Template should include a clear confirmation CTA");
assert.ok(template.includes("If you did not create a Synapse account"), "Template should include an account safety note");
assert.ok(!template.includes("powered by Supabase"), "Synapse template should not include default Supabase footer copy");
assert.ok(resetTemplate.includes("Synapse"), "Reset email body should be branded as Synapse");
assert.ok(resetTemplate.includes("{{ .ConfirmationURL }}"), "Reset template must preserve Supabase confirmation URL variable");
assert.ok(resetTemplate.includes("Choose new password"), "Reset template should include a clear password reset CTA");
assert.ok(resetTemplate.includes("If you did not request this password reset"), "Reset template should include a reset safety note");
assert.ok(!resetTemplate.includes("powered by Supabase"), "Reset template should not include default Supabase footer copy");
assert.ok(readme.includes("Confirm your Synapse account"), "README should document the email subject");
assert.ok(readme.includes("Reset your Synapse password"), "README should document the reset password email subject");
assert.ok(readme.includes("frontend/reset-password.html"), "README should document the reset-password redirect URL");
assert.ok(readme.includes("sender name"), "README should explain how to make the sender show Synapse");

console.log("supabase email template regression passed");
