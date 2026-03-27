# Infrastructure Management

## IPs

[IPs API](https://documentation.mailgun.com/docs/mailgun/api-reference/send/mailgun/ips/get-v3-ips.md) — `/v3/ips`

- List and manage dedicated IPs assigned to your account
- Assign/remove IPs from domain pools
- Get details about specific IPs and their domain assignments

## IP Pools

[IP Pools API](https://documentation.mailgun.com/docs/mailgun/api-reference/send/mailgun/ip-pools/get-v3-ip-pools.md) — `/v3/ip_pools`

- Group dedicated IPs into pools for reputation management
- Create, edit, delete Dedicated IP Pools (DIPPs)
- Link/unlink pools to domains
- Delegate pools to subaccounts

## Dynamic IP Pools

[Dynamic IP Pools API](https://documentation.mailgun.com/docs/mailgun/api-reference/send/mailgun/dynamic-ip-pools/post-v3-domains--name--dynamic-pools.md) — `/v3/dynamic_pools`

- Auto-assign domains to IP pools based on periodic reputation health checks
- Enroll/remove individual domains or all account domains
- Override automatic assignments when needed
- View assignment history per domain

## IP Warmup

[Warmup API](https://documentation.mailgun.com/docs/mailgun/api-reference/send/mailgun/ip-address-warmup/get-v3-ip-warmups.md) — `/v3/ip_warmups`

- Create and manage warmup plans for new dedicated IPs
- New IPs need gradual volume increase to build sender reputation
- Monitor warmup status per IP

## DKIM Keys

[Domain Keys API](https://documentation.mailgun.com/docs/mailgun/api-reference/send/mailgun/domain-keys/get-v1-dkim-keys.md) — `/v1/dkim/keys`

- Create, list, delete DKIM keys across domains
- Activate/deactivate keys per domain via `/v4/domains/{name}/keys`
- Configure automatic key rotation via `/v1/dkim_management/domains/{name}/rotation`
- Update DKIM authority and selectors

## Subaccounts

[Subaccounts API](https://documentation.mailgun.com/docs/mailgun/api-reference/send/mailgun/subaccounts/get-v5-accounts-subaccounts.md) — `/v5/accounts/subaccounts`

- Create and manage child accounts under a parent account
- Each subaccount has independent sending, settings, and reporting
- Enable/disable subaccounts
- Set custom sending limits per subaccount
- Delegate IP pools to subaccounts
