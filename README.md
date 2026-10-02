# WinnerData client workspace

Portable, MIT-licensed codebase for website project review, conversational intake and requirement tracking. Generic examples only. No client records, credentials or private documents.

## Run

Node 22+, no third-party packages. `npm test` runs 38 deterministic tests. `node demo-server.mjs` serves the sample at http://127.0.0.1:8080. Chat is disabled unless `SYNTHETIC_DEMO=1` is set. That mode is explicitly a local test double, not AI and not a live client service. No external model call is made by tests or demo.

## Source

- `service.mjs`: vendor-free application service; auth, store and model are injected.
- `d1-store.mjs`, `access-auth.mjs`, `portable-worker.mjs`: production-target storage/auth/runtime adapters; source implemented, live bindings not provisioned or tested.
- `private-openrouter.mjs`: optional direct free model adapter enforcing no-training/ZDR provider filters and no fallback; must pass live privacy/quota/availability gates before enable.
- `whatsapp-inbound.mjs`: optional signature-verified inbound adapter, no outbound send/model call; account not connected.
- `runtime.test.mjs`, `channel.test.mjs`, `schema.test.mjs`: signed runtime/tenant/SQLite and channel authentication tests, not live client onboarding.
- `private-filing.mjs`: quarantine/scan/reviewer/retention boundary with tests; not a connected malware or storage service, uploads OFF.
- `build-pages.mjs`: dependency-free Pages advanced-mode bundle, does not deploy.
- `CHANNELS.md`: channel integration contract, not a live WhatsApp connection.
- `memory-store.mjs`: synthetic development store, not durable production storage.
- `free-router.mjs`: optional free-only model adapter, contract/privacy gated. No paid fallback, tools, images or files.
- `cloudflare-worker.mjs`, `schema.sql`, `wrangler.example.toml`: earlier platform-specific implementation. NOT wired to portable core, NOT deployed/tested end-to-end. Kept for migration, not the authoritative production entrypoint.
- `index.html`, `data.js`, `chat.js`: responsive sample tracker and endpoint-driven chat client.
- `ADAPTERS.md`: portable adapter contracts and remaining integration work.

## Actual status

The codebase has real HTTP chat/history/requirements flow with server-derived membership, separate tenant transcripts, same-origin writes, byte/output limits, daily quotas and consent gating. Tests use synthetic identities and model replies. Thirty-eight local tests pass. This does NOT establish live client authentication, AI or document storage readiness.

Remaining: production auth/store adapters, live model response contract, actual provider privacy/retention and free quota, intended user login, deployment alias access tests, structured confirmed change proposals, malware review/retention/deletion pipeline and reviewer workflow. Upload and external AI remain OFF. Regex secret checks are a backstop, not a guarantee against sensitive disclosures.

## Safety and workflow

Received is not verified. Completion is verified requirements divided by the current agreed checklist; unknown future scope is not part of that denominator. AI can discuss the website project and suggest changes. It cannot approve legal terms, verify documents or silently apply tracker changes.

Public demo data are not client data. Every private HTML/data/API/object route and deployment alias needs verified identity and server-side client membership before onboarding. No public visitor-chat authority is implied. Use separate private filing and credential vault channels. Client documents/credentials never enter model prompts. Do not commit client data, secrets, private URLs, logs or runtime configuration.

Review branch only; owner reviews merges. No campaign/send or public visitor launch is authorized by this code.
