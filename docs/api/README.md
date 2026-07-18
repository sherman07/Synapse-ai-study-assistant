# Synapse API requests

Import Synapse.postman_collection.json into Postman.

The AI backend is http://127.0.0.1:8001 by default. POST /analyze uses multipart/form-data; provide at least one readable file, a JSON links array, or free_text. The remaining fields are optional and default to:

- preferred_language=auto
- detail_level=auto
- prompt_mode=professor_mode
- note_length=standard_notes
- ai_provider= (backend default)
- client_fingerprint= (optional client cache key)

For the public auth requests, use the included `Sign up email account` and `Resend signup confirmation` requests. Signup requires `firstName`, `lastName`, `email`, `role`, `password`, `confirmPassword`, `termsAccepted`, and `redirectTo`. The backend must have Supabase service-role access and `SYNAPSE_SMTP_HOST` plus `SYNAPSE_SMTP_FROM_EMAIL`; otherwise it returns `state=email_not_configured` and no confirmation email is sent.

The persistence API is http://127.0.0.1:3001. Use either a Supabase bearer token or the local-demo headers configured by the server. For the fast history path, call:

GET /api/generated-content?limit=20&include=metadata

This returns titles and metadata without section bodies. After selecting a note, request:

GET /api/generated-content/:id/sections?page=1&page_size=3

Continue incrementing page while has_next is true. page_size is capped at 10.
