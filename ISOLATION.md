# Live private access acceptance tests

Run against the intended private hostname and each active deployment alias, after account/billing/Access binding configuration is verified. Synthetic tests do not replace these.

- Anonymous GET /, /data.js, /chat.js, /api/session, history, requirements and document URL returns no client data.
- Valid enrolled identity sees only its requests in /api/session.
- Separate tenant B valid identity cannot read/post tenant A history, requirements, chat or document, even with guessed request/object IDs.
- Spoofed authenticated-email header without signed token fails. Expired token, wrong audience, wrong issuer and altered signature fail.
- Same user with multiple requests must select explicitly. It never defaults into an arbitrary client.
- POST wrong Origin, oversized actual body without Content-Length, extra images/tools/attachments fields, secret-pattern text and disabled AI all fail before model call.
- D1 constraints and server-derived object prefix prevent orphan/private cross-client record access. Quarantined documents cannot download until reviewer/malware clearance.
- AI consent NULL and model privacy/quota false keep external processing OFF. No model credentials in page/JS/network response.
- A live successful exchange persists to correct request only; model failure stores no fabricated reply. Rate limits return clear unavailable state, never paid fallback.
- Document deletion/retention runs with scoped IDs and audit, never guessed tenant paths. Missing malware/reviewer workflow keeps uploads OFF.

Private client enrollment is owner-supplied and stored separately. No email/WhatsApp invitation is implied by enrollment. Report each live result and remaining untested route before onboarding.
