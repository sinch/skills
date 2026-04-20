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
| `sinch-authentication` | 1.1.0 | Core | Sinch API auth setup (OAuth2, API keys, dashboard links) |
| `sinch-sdks` | 1.0.0 | Core | SDK installation and client initialization (Node.js, Python, Java, .NET) |
| `sinch-conversation-api` | 1.1.0 | Messaging | Omnichannel messaging — SMS, WhatsApp, RCS, MMS, Viber, and more. Includes channel guides, templates, batch sending, and webhooks |
| `sinch-provisioning-api` | 1.0.1 | Messaging | Provision WhatsApp senders, RCS agents, templates, and webhooks |
| `sinch-voice-api` | 1.1.1 | Voice | Make, receive, and control voice calls (SVAML, IVR, TTS, conferencing) |
| `sinch-in-app-calling` | 1.0.2 | Voice & Video | In-app voice and video SDK |
| `sinch-elastic-sip-trunking` | 1.0.1 | Voice | SIP trunk and number management |
| `sinch-mailgun` | 1.0.1 | Email | Mailgun Email API — sending, receiving, tracking |
| `sinch-mailgun-inspect` | 1.0.2 | Email | Email preview and rendering |
| `sinch-mailgun-optimize` | 1.0.1 | Email | Email deliverability optimization |
| `sinch-mailgun-validate` | 1.0.2 | Email | Email address verification |
| `sinch-numbers-api` | 1.1.1 | Numbers | Search, rent, manage, and release phone numbers |
| `sinch-number-order-api` | 1.0.2 | Numbers | Multi-step number ordering with KYC compliance |
| `sinch-imported-numbers-hosting-orders` | 1.0.1 | Numbers | Import, host, and text-enable non-Sinch phone numbers |
| `sinch-10dlc` | 1.1.1 | Numbers | US 10DLC brand and campaign registration |
| `sinch-porting-api` | 1.0.1 | Numbers | Port phone numbers from other carriers into Sinch |
| `sinch-verification-api` | 1.0.1 | Verification | Phone number verification (SMS, Voice, Flashcall, WhatsApp) |
| `sinch-number-lookup-api` | 1.0.3 | Numbers | Phone number lookup and validation |
| `sinch-fax-api` | 1.0.2 | Voice | Send and receive faxes |

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
