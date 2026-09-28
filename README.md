# Sinch Skills

AI agent skills for Sinch communication APIs. Get expert guidance on getting started, best practices, and gotchas -- right inside your AI coding agent.

## Installation

```bash
npx skills add sinch/skills
```

These skills can also be installed via the [Sinch Plugins](https://github.com/sinch/sinch-plugins/).

## Available Skills

| Skill | Version | Category | Description |
|-------|---------|----------|-------------|
| `sinch-authentication` | 1.3.0 | Core | Sinch API auth setup (OAuth2, API keys, dashboard links) |
| `sinch-sdks` | 1.2.0 | Core | SDK installation and client initialization (Node.js, Python, Java, .NET) |
| `sinch-conversation-api` | 2.1.0 | Messaging | Omnichannel messaging API layer — apps, contacts, message types, templates, batch sending, and webhooks |
| `sinch-sms` | 1.2.0 | Messaging | SMS channel of the Conversation API — sender IDs, encoding, message parts, opt-out handling |
| `sinch-mms` | 1.2.0 | Messaging | MMS channel of the Conversation API — media messages to US/CA/AU numbers |
| `sinch-rcs` | 1.2.0 | Messaging | RCS channel of the Conversation API — rich cards, carousels, suggested actions, SMS fallback |
| `sinch-whatsapp` | 1.2.0 | Messaging | WhatsApp channel of the Conversation API — templates, 24-hour window, opt-in rules |
| `sinch-provisioning-api` | 1.2.0 | Messaging | Provision WhatsApp senders, RCS agents, templates, and webhooks |
| `sinch-voice-api` | 1.3.0 | Voice | Make, receive, and control voice calls (SVAML, IVR, TTS, conferencing) |
| `sinch-voice-api-v2` | 0.3.0 | Voice | Build preview Voice API v2 call flows, webhooks, IVR, bridging, and AI voice connections |
| `sinch-in-app-calling` | 1.2.0 | Voice & Video | In-app voice and video SDK |
| `sinch-elastic-sip-trunking` | 1.2.1 | Voice | SIP trunk and number management |
| `sinch-mailgun` | 1.2.0 | Email | Mailgun Email API — sending, receiving, tracking |
| `sinch-mailgun-inspect` | 1.2.0 | Email | Email preview and rendering |
| `sinch-mailgun-optimize` | 1.2.0 | Email | Email deliverability optimization |
| `sinch-mailgun-validate` | 1.2.0 | Email | Email address verification |
| `sinch-numbers-api` | 1.3.0 | Numbers | Search, rent, manage, and release phone numbers |
| `sinch-number-order-api` | 1.2.0 | Numbers | Multi-step number ordering with KYC compliance |
| `sinch-imported-numbers-hosting-orders` | 1.2.0 | Numbers | Import, host, and text-enable non-Sinch phone numbers |
| `sinch-10dlc` | 1.3.0 | Numbers | US 10DLC brand and campaign registration |
| `sinch-porting-api` | 1.2.0 | Numbers | Port phone numbers from other carriers into Sinch |
| `sinch-verification-api` | 1.2.0 | Verification | Phone number verification (SMS, Voice, Flashcall, WhatsApp) |
| `sinch-number-lookup-api` | 1.2.0 | Numbers | Phone number lookup and validation |
| `sinch-fax-api` | 1.2.0 | Voice | Send and receive faxes |
| `sinch-cli` | 1.1.0 | Functions | Terminal commands for the Sinch CLI (`@sinch/cli`) — Functions, Voice, Numbers, Conversation, Fax, SIP, secrets |
| `sinch-functions` | 1.1.0 | Functions | Sinch Functions platform overview — beta serverless runtime for voice, SMS, and conversation apps |
| `sinch-functions-node` | 1.1.0 | Functions | Write Node.js/TypeScript Sinch Functions (`@sinch/functions-runtime`) — voice handlers, SVAML builders, Conversation webhooks |
| `sinch-functions-dotnet` | 1.1.0 | Functions | Write C#/.NET Sinch Functions (`Sinch.Functions.Runtime`) — controllers, SVAML builders, DI, ASP.NET conventions |

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

Full authoring guide: [CONTRIBUTING.md](CONTRIBUTING.md). In short:

1. Create `skills/<product-name>/SKILL.md` with YAML frontmatter (`---` delimiters, `name` and `description` fields)
2. Fill in the YAML frontmatter and all body sections
3. Keep each SKILL.md under 500 lines
4. Use `sinch-<product>` naming for the `name` field
5. Write for AI agents: concise, actionable, include code examples
6. Use curl and Node.js SDK (`@sinch/sdk-core`) for examples. Exception: Mailgun skills use `mailgun.js`.

## Links

- [Sinch Plugins](https://github.com/sinch/sinch-plugins/)
- [Sinch Developer Docs](https://developers.sinch.com)
- [Sinch Dashboard](https://dashboard.sinch.com)
- [skills.sh](https://skills.sh/)

## Use of Sinch Services 

These Skills provides developers with a way to interact with Sinch APIs and services from supported developer tools or environments. Use of Sinch services requires a valid Sinch account and is subject to the applicable Sinch Terms of Service available at: [https://sinch.com/legal/terms-and-conditions/other-sinch-terms-conditions/sinch-engage/sinch-engage-terms/](https://sinch.com/legal/terms-and-conditions/other-sinch-terms-conditions/sinch-engage/sinch-engage-terms/)

These Skills may be used in conjunction with third-party developer tools, IDEs, platforms, or environments that are not operated or controlled by Sinch. Such third-party tools or platforms are subject to their own terms and policies.
 
These Skills are provided on an “as-is” basis, and Sinch is not responsible for the operation, availability, performance, or security of any third-party tools or platforms.

## License

Apache-2.0

Copyright Sinch AB, https://sinch.com

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

## Use of Sinch Services

**Use of Sinch Services**

*This repository contains plugins/code that enable developers to interact with Sinch APIs and services from supported developer tools or environments. Use of Sinch services requires a valid Sinch account and is subject to the applicable Sinch Terms of Service available at:* [*https://sinch.com/legal/terms-and-conditions/other-sinch-terms-conditions/terms-of-service/*](https://sinch.com/legal/terms-and-conditions/other-sinch-terms-conditions/terms-of-service/?utm_source=GitHub&utm_medium=sinch_skills_repo)