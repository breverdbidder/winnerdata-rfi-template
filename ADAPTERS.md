# Replaceable interfaces

The browser uses same-origin `/api/requests/:id/{history,chat,requirements}`. The core service accepts Web Request/Response and no vendor SDK. Implement it on Node, a Worker or another web runtime.

- Auth `verify(request)` returns a verified, stable `subject`, never an unverified email header. The Cloudflare example verifies a signed Access JWT. Another OIDC provider can replace it.
- Store `resolveMembership(subject,requestId)` returns server-derived `clientId`, `role`, `aiConsentAt`, or null. `history`, `requirements`, `reserveQuota` and `appendExchange` always receive this scope. Reserve quota atomically. Append both messages and audit atomically. SQLite/D1 is one implementation, Postgres another. MemoryStore is synthetic development only.
- Model `reply({message,history,maxOutputTokens,signal})` returns plain text or fails. No images, tools, files or documents. No paid fallback. Provider selection, privacy and retention are deployment gates. Responses are untrusted display text, not permission or verification.
- Private filing is separate from AI. The Cloudflare R2 example stays disabled until malware review, retention and authenticated tenant isolation are validated. Another private object store can replace it.
- Host static assets on any web server. Protect all private HTML/data/API/deployment aliases. A public demo is not a private workspace.

Pending: live database adapter wiring, auth onboarding, model response contract, exact provider privacy, end-to-end deployment tests, reviewer-confirmed structured updates, malware pipeline. No source file contains client data or secrets.
