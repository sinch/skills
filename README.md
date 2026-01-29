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
| `sinch-conversation-api` | Messaging | Omnichannel messaging via Conversation API (SMS, WhatsApp, RCS, MMS) |
| `sinch-sms` | Messaging | Send and receive SMS messages |
| `sinch-whatsapp` | Messaging | WhatsApp Business messaging |
| `sinch-rcs` | Messaging | Rich Communication Services messaging |
| `sinch-mms` | Messaging | Multimedia messaging (images, video, audio) |
| `sinch-provisioning-api` | Messaging | Provision accounts, credentials, and numbers |
| `sinch-voice-api` | Voice & Video | Make, receive, and control voice calls |
| `sinch-in-app-calling` | Voice & Video | In-app voice and video SDK |
| `sinch-elastic-sip-trunking` | Voice & Video | SIP trunk and number management |
| `sinch-mailgun` | Email | Email API via Mailgun |
| `sinch-mailjet` | Email | Email delivery via Mailjet |
| `sinch-mailgun-inspect` | Email | Email preview and rendering |
| `sinch-mailgun-optimize` | Email | Email deliverability optimization |
| `sinch-numbers` | Numbers | Purchase, import, and manage phone numbers |
| `sinch-10dlc` | Numbers | US 10DLC brand and campaign registration |
| `sinch-verification-api` | Verification | Phone number verification (SMS, Voice, Flashcall) |
| `sinch-number-lookup` | Verification | Phone number lookup and validation |
| `sinch-fax` | Other | Send and receive faxes |

## Skill Structure

```
skills/
  <product>/
    SKILL.md            # Main skill file (required)
    scripts/            # Optional helper scripts
    references/         # Optional detailed reference material
    assets/             # Optional images or other assets
template/
  SKILL.md              # Skeleton for new skills
```

Each skill lives in its own folder under `skills/`. The `SKILL.md` file contains YAML frontmatter (`name` and `description`) and markdown sections covering Overview, Getting Started, Key Concepts, Common Patterns, Gotchas & Best Practices, and Links.

## Contributing

1. Copy `template/SKILL.md` to `skills/<product-name>/SKILL.md`
2. Fill in the YAML frontmatter and all body sections
3. Keep each SKILL.md under 500 lines
4. Use `sinch-<product>` naming for the `name` field
5. Write for AI agents: concise, actionable, include code examples
6. Use curl and Node.js SDK (`@sinch/sdk-core`) for examples

## Links

- [Sinch Developer Docs](https://developers.sinch.com)
- [Sinch Dashboard](https://dashboard.sinch.com)
- [skills.sh](https://skills.sh/)

## License

MIT
