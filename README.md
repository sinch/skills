# Sinch Skills

AI agent skills for Sinch communication APIs. Get expert guidance on getting started, best practices, and gotchas -- right inside your AI coding agent.

## Installation

```bash
npx skills add sinch/skills
```

## Available Skills

| Skill | Category | Description |
|-------|----------|-------------|
| `sinch-authentication` | Core | Sinch API auth setup (OAuth2, API keys, SDK init, dashboard links) |
| `sinch-conversation-api` | Messaging | Omnichannel messaging — SMS, WhatsApp, RCS, MMS, Viber, and more. Includes channel guides, templates, batch sending, and webhooks |
| `sinch-provisioning-api` | Messaging | Provision WhatsApp senders, RCS agents, templates, and webhooks |
| `sinch-voice-api` | Voice & Video | Make, receive, and control voice calls (SVAML, IVR, TTS, conferencing) |
| `sinch-in-app-calling` | Voice & Video | In-app voice and video SDK |
| `sinch-elastic-sip-trunking` | Voice & Video | SIP trunk and number management |
| `sinch-mailgun` | Email | Mailgun Email API — sending, receiving, tracking |
| `sinch-mailgun-inspect` | Email | Email preview and rendering |
| `sinch-mailgun-optimize` | Email | Email deliverability optimization |
| `sinch-mailgun-validate` | Email | Email address verification |
| `sinch-numbers-api` | Numbers | Search, rent, manage, and release phone numbers |
| `sinch-number-order-api` | Numbers | Multi-step number ordering with KYC compliance |
| `sinch-imported-numbers-hosting-orders` | Numbers | Import, host, and text-enable non-Sinch phone numbers |
| `sinch-10dlc` | Numbers | US 10DLC brand and campaign registration |
| `sinch-verification-api` | Verification | Phone number verification (SMS, Voice, Flashcall, WhatsApp) |
| `sinch-number-lookup-api` | Verification | Phone number lookup and validation |
| `sinch-fax-api` | Other | Send and receive faxes |

## Skill Structure

```
skills/
  <product>/
    SKILL.md            # Main skill file (required)
    scripts/            # Optional helper scripts
    references/         # Optional detailed reference material
    assets/             # Optional images or other assets
```

Each skill lives in its own folder under `skills/`. The `SKILL.md` file contains YAML frontmatter (`name` and `description`) and markdown sections covering Overview, Getting Started, Key Concepts, Common Patterns, Gotchas & Best Practices, and Links.

## Contributing

1. Create `skills/<product-name>/SKILL.md` with YAML frontmatter (`---` delimiters, `name` and `description` fields)
2. Fill in the YAML frontmatter and all body sections
3. Keep each SKILL.md under 500 lines
4. Use `sinch-<product>` naming for the `name` field
5. Write for AI agents: concise, actionable, include code examples
6. Use curl and Node.js SDK (`@sinch/sdk-core`) for examples. Exception: Mailgun skills use `mailgun.js`.

## Links

- [Sinch Developer Docs](https://developers.sinch.com)
- [Sinch Dashboard](https://dashboard.sinch.com)
- [skills.sh](https://skills.sh/)

## License

MIT
