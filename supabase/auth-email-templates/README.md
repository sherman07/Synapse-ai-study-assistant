# Synapse Supabase Auth Email Templates

These templates replace the default Supabase Auth emails with Synapse-branded transactional emails.

## Confirm Signup

Use this for Supabase Dashboard -> Authentication -> Email Templates -> Confirm signup.

Subject:

```text
Confirm your Synapse account
```

Body:

```text
supabase/auth-email-templates/confirm-signup.html
```

The template uses Supabase's built-in `{{ .ConfirmationURL }}` variable.

## Reset Password

Use this for Supabase Dashboard -> Authentication -> Email Templates -> Reset password.

Subject:

```text
Reset your Synapse password
```

Body:

```text
supabase/auth-email-templates/reset-password.html
```

The template uses Supabase's built-in `{{ .ConfirmationURL }}` variable. Synapse sends reset requests with a redirect URL that points to:

```text
http://localhost:5176/frontend/reset-password.html
```

Add this URL to Supabase Dashboard -> Authentication -> URL Configuration -> Redirect URLs. Add your deployed production reset-password URL before launch.

## Make The Sender Say Synapse

The visible sender name is not controlled by the HTML template. It is controlled by Supabase Auth mail settings.

For production quality, configure custom SMTP:

1. Supabase Dashboard -> Authentication -> SMTP Settings.
2. Enable custom SMTP.
3. Set sender name to:

```text
Synapse
```

4. Use a sender address such as:

```text
no-reply@your-domain.com
```

Until custom SMTP is configured, Gmail may still show the sender as `Supabase Auth <noreply@mail.app.supabase.io>` even when the email body is Synapse-branded.

## Deliverability Notes

Supabase's default SMTP is for development and has strict delivery limits. For real users, use a dedicated SMTP provider such as Resend, Postmark, AWS SES, SendGrid, Brevo, or ZeptoMail, then configure SPF, DKIM, and DMARC for the sending domain.

Keep auth emails focused. Do not add marketing copy, images, or extra links to this template.
