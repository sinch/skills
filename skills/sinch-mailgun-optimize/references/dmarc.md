# DMARC Reports — Endpoint Reference

Base path: `/v1/dmarc/`

Requires a DMARC DNS record configured on the domain before report data becomes available.

## Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/dmarc/setup` | GET | Check if DMARC reporting is set up for the account |
| `/v1/dmarc/records/{domain}` | GET | Retrieve DMARC DNS records for configuration |
| `/v1/dmarc/referral` | POST | Get referral link to Redsift DMARC dashboard (body: `{ "email": "..." }`) |
| `/v1/dmarc/domains` | GET | Aggregate DMARC data for all domains |
| `/v1/dmarc/domains/{domain}` | GET | DMARC data for a single domain |
| `/v1/dmarc/domains/{domain}/s/{source}` | GET | Drill down by sending source |
| `/v1/dmarc/domains/{domain}/s/{source}/h/{host}` | GET | Drill down by host within a source |
| `/v1/dmarc/domains/{domain}/s/{source}/h/{host}/ip/{ip}` | GET | Drill down to a specific sending IP |

## Drill-Down Hierarchy

DMARC data follows a hierarchy for progressive investigation:

```
domains → domains/{domain} → .../s/{source} → .../h/{host} → .../ip/{ip}
```

Start with the domain-level view, then drill into sources, hosts, and IPs to identify which infrastructure is failing DMARC alignment.

## Setup Flow

1. Check setup status — `GET /v1/dmarc/setup`
2. Get DNS records — `GET /v1/dmarc/records/{domain}`
3. Configure DMARC DNS TXT record on the domain (e.g., `v=DMARC1; p=none; ...`)
4. Wait for reports to aggregate, then query — `GET /v1/dmarc/domains/{domain}`

## Links

- API docs: https://documentation.mailgun.com/docs/inboxready/api-reference/optimize/inboxready/dmarc-reports
