---
name: sinch-provisioning-api
description: Provisions and manages channel resources for Conversation API projects, including WhatsApp accounts/senders/templates, RCS senders, KakaoTalk senders/templates, webhooks, and bundles. Use when the user asks to onboard channels, configure provisioning webhooks, manage templates, orchestrate multi-service bundles, or automate channel setup.
metadata:
  author: Sinch
  version: 1.0.2
  category: Messaging
  tags: provisioning, whatsapp, rcs, kakaotalk, channels, templates, bundles
  uses:
    - sinch-authentication
---

# Sinch Provisioning API

## Overview

Use this skill for Conversation API channel provisioning. Validated against Provisioning API v1.2.36.
Prefer deterministic flows: confirm context, choose endpoint family, execute minimal calls, verify state.

## Agent Workflow (Default)

Use this sequence unless the user requests otherwise.

1. Confirm scope and identifiers
- Confirm `projectId`
- Confirm microservice scope — each is a separate REST service: WhatsApp, RCS, KakaoTalk, Conversation, Webhooks, or Bundles

2. Choose the endpoint family first
- WhatsApp account/senders/templates/flows/solutions: `/v1/projects/{projectId}/whatsapp/...`
- RCS: `/v1/projects/{projectId}/rcs/...`
- KakaoTalk: `/v1/projects/{projectId}/kakaotalk/...`
- Conversation (channel info): `/v1/projects/{projectId}/conversation/...`
- Webhooks: `/v1/projects/{projectId}/webhooks...`
- Bundles: `/v1/projects/{projectId}/bundles...`

3. Apply safe defaults
- Webhook `target` must be unique per project
- Use `ALL` for webhook triggers when broad coverage is needed
- WhatsApp template language delete: `deleteSubmitted` defaults to `false`

4. Verify async operations
- Some operations are asynchronous — register a provisioning webhook to receive completion notifications
- Webhook payloads contain the full JSON response as payload
- Alternatively, poll status endpoints for state changes
- For bundles, subscribe to `BUNDLE_DONE`

5. Handle failures predictably
- All endpoints return a PAPI Error (Provisioning API Error) on failure:
  ```json
  {
    "errorCode": "string (enum)",
    "message": "string (human-readable errorCode)",
    "resolution": "string (what can be changed/improved)",
    "additionalInformation": {} // optional, contains context e.g. senderId
  }
  ```
- For `429` and `5xx`, retry with bounded backoff (default: max 3 retries, exponential + jitter, max 10s delay)
- For `4xx`, use `resolution` and `additionalInformation` from the PAPI Error to guide correction

6. Return actionable result
- Include resource IDs, resulting state, and next required action

## Getting Started

### Authentication

See [sinch-authentication](../sinch-authentication/SKILL.md) for full auth setup.

Supported auth methods:
- OAuth 2.0 bearer token (recommended)
- HTTP Basic auth

Prefer OAuth 2.0 for automation/CI. Use Basic auth only for quick manual tests.

### Canonical curl Example

```bash
curl -X GET \
  "https://provisioning.api.sinch.com/v1/projects/$SINCH_PROJECT_ID/whatsapp/senders" \
  -H "Authorization: Bearer $SINCH_ACCESS_TOKEN"
```

## Microservices

All endpoints are under `https://provisioning.api.sinch.com/v1/projects/{projectId}/`. All return JSON responses. List endpoints are paginated; follow `nextPageToken` to retrieve all results.

| Service | Base path | What it covers | Docs |
|---------|-----------|---------------|------|
| WhatsApp | `/whatsapp/...` | Accounts, senders (register/verify), templates, flows, solutions | [Accounts](https://developers.sinch.com/docs/provisioning-api/api-reference/provisioning-api/whatsapp.md), [Senders](https://developers.sinch.com/docs/provisioning-api/api-reference/provisioning-api/whatsapp-senders.md), [Templates](https://developers.sinch.com/docs/provisioning-api/api-reference/provisioning-api/whatsapp-templates.md), [Flows](https://developers.sinch.com/docs/provisioning-api/api-reference/provisioning-api/whatsapp-flows.md), [Solutions](https://developers.sinch.com/docs/provisioning-api/api-reference/provisioning-api/whatsapp-solutions.md) |
| RCS | `/rcs/...` | Accounts, senders (launch), questionnaire, test numbers | [Accounts](https://developers.sinch.com/docs/provisioning-api/api-reference/provisioning-api/rcs-accounts.md), [Senders](https://developers.sinch.com/docs/provisioning-api/api-reference/provisioning-api/rcs-senders.md), [Questionnaire](https://developers.sinch.com/docs/provisioning-api/api-reference/provisioning-api/rcs-questionnaire.md) |
| KakaoTalk | `/kakaotalk/...` | Categories, senders (register/verify), templates | [Categories](https://developers.sinch.com/docs/provisioning-api/api-reference/provisioning-api/kakaotalk-categories.md), [Senders](https://developers.sinch.com/docs/provisioning-api/api-reference/provisioning-api/kakaotalk-senders.md), [Templates](https://developers.sinch.com/docs/provisioning-api/api-reference/provisioning-api/kakaotalk-templates.md) |
| Bundles | `/bundles/...` | Orchestrator: create Conversation App, assign test number, link apps, create subproject, register webhooks | [Bundles](https://developers.sinch.com/docs/provisioning-api/api-reference/provisioning-api/bundles.md) |
| Conversation | `/conversation/...` | Sender info for Instagram, Messenger, Telegram, Viber | [Conversation](https://developers.sinch.com/docs/provisioning-api/api-reference/provisioning-api/conversation.md) |
| Webhooks | `/webhooks/...` | Provisioning webhook registration and management | [Webhooks](https://developers.sinch.com/docs/provisioning-api/api-reference/provisioning-api/webhooks.md) |

## Trigger Strategy (Webhook)

Use `ALL` unless the user explicitly asks for selective triggers.
If `ALL` is used, do not combine it with other trigger values.
For production, prefer selective triggers when broad audit coverage is not required.

When selective filtering is requested, choose by family:
- WhatsApp account: `WHATSAPP_ACCOUNT_*`, `WHATSAPP_WABA_ACCOUNT_CHANGED`
- WhatsApp sender/template: `WHATSAPP_SENDER_*`, `WHATSAPP_TEMPLATE_*`
- RCS: `RCS_ACCOUNT_COMMENT_ADDED`, `RCS_SENDER_*`
- KakaoTalk: `KAKAOTALK_SENDER_*`, `KAKAOTALK_TEMPLATE_*`
- Bundles: `BUNDLE_DONE`

## Critical Gotchas

1. Sender OTP flow order is strict (WhatsApp and KakaoTalk)
- Register first, then verify

2. WhatsApp templates are project-level
- Do not route through sender-scoped template paths

3. Template delete behavior
- Language-specific delete defaults to draft-only unless `deleteSubmitted=true` (query flag)

4. Webhook uniqueness constraint
- Uniqueness is on `target` URL per project, not on trigger overlap

5. Async completion
- Sender/template/account transitions can be asynchronous; rely on status endpoints or webhooks

6. Deprecated WhatsApp utility endpoints
- `longLivedAccessToken` and `wabaDetails` are deprecated. Use only for legacy flows when explicitly requested.

## Links

Use these pages instead of adding inline examples.

- [Provisioning API Reference](https://developers.sinch.com/docs/provisioning-api/api-reference/provisioning-api.md)
- [Webhooks](https://developers.sinch.com/docs/provisioning-api/api-reference/provisioning-api/webhooks.md)
- [WhatsApp Accounts](https://developers.sinch.com/docs/provisioning-api/api-reference/provisioning-api/whatsapp.md)
- [WhatsApp Senders](https://developers.sinch.com/docs/provisioning-api/api-reference/provisioning-api/whatsapp-senders.md)
- [WhatsApp Templates](https://developers.sinch.com/docs/provisioning-api/api-reference/provisioning-api/whatsapp-templates.md)
- [WhatsApp Flows](https://developers.sinch.com/docs/provisioning-api/api-reference/provisioning-api/whatsapp-flows.md)
- [WhatsApp Solutions](https://developers.sinch.com/docs/provisioning-api/api-reference/provisioning-api/whatsapp-solutions.md)
- [RCS Accounts](https://developers.sinch.com/docs/provisioning-api/api-reference/provisioning-api/rcs-accounts.md)
- [RCS Questionnaire](https://developers.sinch.com/docs/provisioning-api/api-reference/provisioning-api/rcs-questionnaire.md)
- [RCS Senders](https://developers.sinch.com/docs/provisioning-api/api-reference/provisioning-api/rcs-senders.md)
- [KakaoTalk Categories](https://developers.sinch.com/docs/provisioning-api/api-reference/provisioning-api/kakaotalk-categories.md)
- [KakaoTalk Senders](https://developers.sinch.com/docs/provisioning-api/api-reference/provisioning-api/kakaotalk-senders.md)
- [KakaoTalk Templates](https://developers.sinch.com/docs/provisioning-api/api-reference/provisioning-api/kakaotalk-templates.md)
- [Conversation Channels](https://developers.sinch.com/docs/provisioning-api/api-reference/provisioning-api/conversation.md)
- [Bundles](https://developers.sinch.com/docs/provisioning-api/api-reference/provisioning-api/bundles.md)
- [Getting Started with KakaoTalk](https://developers.sinch.com/docs/provisioning-api/getting-started/kakaotalk.md)
- [Getting Started with WhatsApp](https://developers.sinch.com/docs/provisioning-api/getting-started/whatsapp.md)
- [Provisioning API OpenAPI YAML](https://developers.sinch.com/_bundle/docs/provisioning-api/api-reference/provisioning-api.yaml?download)
- [Release Notes](https://developers.sinch.com/docs/provisioning-api/release-notes.md)
- [LLMs.txt](https://developers.sinch.com/llms.txt)
