# Private deployment checklist

This is an unfinished service, not a production launch. Review branch, no auto merge.

1. Owner confirms exact client login identity and private audience. Keep enrollment data out of this repository. Add only scoped request memberships, not a shared admin group.
2. Provision private store and auth on the approved existing account. Use schema.sql; test tenant A and tenant B with live verified identities. Every deployment alias and HTML/data/API/object route must enforce identity/membership.
3. Model adapter: verify provider-specific terms, OpenRouter account logging/training settings, zero-retention eligibility, live :free price and quota. Require explicit permission for the scoped model disclosure after those facts are known. Use private-openrouter.mjs filters; no fallback to weaker privacy or paid model. A successful synthetic test is not model readiness.
4. Runtime config uses server secrets. No browser API key. portable-worker.mjs is the current production-target entrypoint, old cloudflare-worker.mjs is migration reference only. Start chat OFF.
5. UI bootstrap uses authenticated /api/session and server-derived memberships. If exactly one request is available it loads that request; multiple requests require an explicit selector (not implemented yet). Demo uses synthetic window.RFI_CHAT only. Do not inject arbitrary client IDs and claim authentication.
6. Confirm exchange history, quota, origins, error/timeout handling, output bounds and audit in deployed environment. AI never verifies legal/doc requirements.
7. Upload stays OFF until real quarantine/malware/reviewer/retention/deletion tests pass. Filenames/object IDs/URLs must not become public.
8. WhatsApp stays unconnected until owner-controlled account/number, signed webhook validation, identity opt-in/mapping, pricing/window/approved-message scopes and account settings are verified. Do not borrow another service's line.
9. Owner reviews final merge/deploy effects. No visitor-chat launch, campaigns, invitations or outbound client messages from this codebase alone.

## Current provider research, not an endorsement

OpenRouter endpoint API currently lists ModelRun for qwen/qwen3.8-27b:free at zero token prices; provider table lists no training/zero retention. Linked Modular general terms include derivative-data rights. Account-specific and endpoint-specific privacy treatment still needs validation. Google AI Studio endpoint is not ZDR (table shows 55 days); direct unpaid API terms also permit training/human review, while OpenRouter table lists no training. Do not substitute direct terms for an unverified upstream contract.

Sources: https://openrouter.ai/api/v1/models/qwen/qwen3.8-27b:free/endpoints , https://openrouter.ai/providers , https://www.modular.com/legal/terms , https://openrouter.ai/privacy , https://ai.google.dev/gemini-api/terms . Catalog/settings may change; recheck at enable time.
