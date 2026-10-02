# Portable messaging channels

Web chat and WhatsApp can share a client-scoped dashboard history. This is an API/webhook integration, not an iframe of WhatsApp Web and not an import of someone's unrelated private chat.

## Channel adapter contract

Normalize inbound events as `{channel,providerMessageId,businessAccountId,businessNumberId,senderId,receivedAt,text}` after verifying the provider's webhook signature and destination account. The server maps the verified account/number/sender tuple to an explicitly enrolled client/request. Never trust a clientId/requestId supplied in message text. Reject unknown identities and groups by default. Use providerMessageId plus destination account for deduplication; preserve the original channel/sender/direction in display and audit.

Attachments remain outside model prompts. They need separately authenticated private filing, authorization, quarantine and retention, not arbitrary URL retrieval from message text.

A channel store should support authorized `history(actor)` and atomic inbound append/dedup. A send adapter needs the approved outgoing recipient/text, customer-service-window eligibility, template/category/cost policy and scoped user communication authority. UI draft preparation does not imply send approval. No outbound WhatsApp action is implemented here.

## Official WhatsApp integration deployment gates

A verified owner-controlled WhatsApp Business Platform account/number, server-only credentials, verified webhook signature, explicit client opt-in/identity mapping, private dashboard auth, consent/retention rules and live rate/cost checks are required. Do not reuse another service's messaging number or private conversation history. New number registration, BSP subscriptions, paid templates and outbound messages require approval. Existing integration/account state is not yet verified.

Meta inbound messages are not charged; non-template service responses are only allowed within the 24-hour customer-service window and currently free under Meta pricing. Outside that window, approved templates are required and can cost money; rates/category/market and any BSP fees need final verification. No free-forever claim is made.

This file specifies a replaceable adapter contract, not a deployed webhook or a working WhatsApp connection. Web chat source works independently through its same-origin API.
