# Changelog

All notable changes to this project will be documented in this file. Individual skills have their own versions in metadata.

## 2026-04-17

### Added

- `sinch-porting-api` v1.0.0 — New skill for porting phone numbers from other carriers into Sinch
- `sinch-sdks` v1.0.0 — New skill for SDK installation and client initialization (Node.js, Python, Java, .NET)
- `.gitignore` file
- Java SDK examples for Voice API

### Changed

- `sinch-10dlc` v1.1.0 — Streamlined authentication instructions; updated description, tags, and metadata
- `sinch-authentication` v1.1.0 — Clarified auth methods; added metadata with category and tags
- `sinch-conversation-api` v1.1.0 — Streamlined SKILL.md; added metadata with category, tags, and usage references
- `sinch-elastic-sip-trunking` v1.0.1 — Added metadata; referenced sinch-sdks skill for SDK setup
- `sinch-fax-api` v1.0.1 — Fixed category from Messaging to Voice; added metadata
- `sinch-imported-numbers-hosting-orders` v1.0.1 — Added metadata; standardized credential placeholders
- `sinch-in-app-calling` v1.0.1 — Added Key Concepts section; referenced sinch-authentication for credential setup
- `sinch-mailgun` v1.0.1 — Enhanced documentation; added metadata with category and tags
- `sinch-mailgun-inspect` v1.0.2 — Added metadata; standardized credential placeholders
- `sinch-mailgun-optimize` v1.0.1 — Enhanced documentation; added metadata with category and tags
- `sinch-mailgun-validate` v1.0.1 — Added metadata; improved security guidance for URL handling; standardized credential placeholders
- `sinch-number-lookup-api` v1.0.2 — Simplified SKILL.md; added `sinch-sdks` usage reference; added metadata
- `sinch-number-order-api` v1.0.1 — Enhanced documentation; added metadata with category and tags
- `sinch-numbers-api` v1.1.0 — Updated Python and Java reference examples; added metadata with category and tags
- `sinch-provisioning-api` v1.0.1 — Added metadata with category, tags, and skill references
- `sinch-verification-api` v1.0.1 — Added metadata; consolidated SDK references to sinch-sdks skill
- `sinch-voice-api` v1.1.0 — Updated Java reference examples; enhanced documentation; added metadata
- `README.md` — Removed duplicate `sinch-authentication` row; added `sinch-porting-api`; updated descriptions
- Updated SDK init references across Node.js, Python, Java, and .NET for latest SDK versions
- Enhanced metadata (category, tags, uses) across all skills

### Fixed

- Addressed Snyk security scan warnings across all skills (credential placeholder standardization, URL trust boundaries)
- Removed redundant SDK installation tables from skills that now reference sinch-sdks

## 2026-04-01

### Changed

- Added Sinch usage disclaimer to README
- Synced skills from internal GitLab repository

## 2026-03-30

### Fixed

- Fixed Node.js SDK init reference

## 2026-03-27

### Added

- Skills 1.0.0 public release with initial set of skills

### Changed

- Updated license from MIT to Apache 2.0
- Enhanced README with installation instructions
- Fixed conversation region usage in SDK init references

## 2026-02-06

### Changed

- Updated RCS channel skills

## 2026-02-05

### Changed

- Updated RCS skills content

## 2026-01-30

### Fixed

- Updated SKILL.md formatting

## 2026-01-29

### Added

- Initial commit — first version of Sinch skills repository
- Added best practices guide and skill links
- Added OpenAPI links, fixed Overview headers, removed duplicates

### Fixed

- Corrected technical inaccuracies and link formatting across 7 skills
- Added `.md` extensions to doc links, fixed broken URLs
