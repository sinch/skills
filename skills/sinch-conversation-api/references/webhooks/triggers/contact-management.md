# Contact Management Triggers

← [Back to Conversation API SKILL.md](../../../SKILL.md)

**Sections:** [Overview](#overview) | [CONTACT_CREATE](#contact_create) | [CONTACT_UPDATE](#contact_update) | [CONTACT_DELETE](#contact_delete) | [CONTACT_MERGE](#contact_merge) | [CONTACT_IDENTITIES_DUPLICATION](#contact_identities_duplication) | [Key Points](#key-points)

## Overview

Contact management triggers notify you when contacts are created, updated, deleted, merged, or when duplicate identities are detected. These triggers enable you to keep external systems synchronized with Conversation API contact data and detect potential data quality issues.

The five contact management triggers are:

- `CONTACT_CREATE` — New contact created
- `CONTACT_UPDATE` — Contact information updated
- `CONTACT_DELETE` — Contact deleted
- `CONTACT_MERGE` — Two contacts merged into one
- `CONTACT_IDENTITIES_DUPLICATION` — Duplicate channel identities detected

## CONTACT_CREATE

### When It Fires

- New contact created via API (`POST /v1/projects/{project_id}/contacts`)
- Contact automatically created when first message received from unknown identity (if auto-create enabled)

### Callback Structure

```json
{
  "app_id": "01H1234567...",
  "accepted_time": "2024-06-15T14:00:00.123Z",
  "project_id": "PROJECT123",
  "contact_create_notification": {
    "contact": {
      "id": "01H3333333...",
      "channel_identities": [
        {
          "channel": "WHATSAPP",
          "identity": "46732001122",
          "app_id": "01H1234567..."
        }
      ],
      "display_name": "John Doe",
      "email": "john.doe@example.com",
      "external_id": "customer_12345",
      "metadata": "",
      "language": "EN"
    }
  }
}
```

### Key Fields

| Field                        | Description                                                    |
| ---------------------------- | -------------------------------------------------------------- |
| `contact.id`                 | Unique contact identifier                                      |
| `contact.channel_identities` | Array of channel endpoints (phone numbers, WhatsApp IDs, etc.) |
| `contact.display_name`       | Contact's display name (optional)                              |
| `contact.external_id`        | Your system's identifier for this contact                      |
| `contact.metadata`           | Custom JSON metadata                                           |
| `contact.language`           | Preferred language code                                        |

### Common Use Cases

1. **CRM Synchronization** — Create corresponding contact records in your CRM when new contacts are added
2. **Welcome Workflows** — Trigger onboarding sequences for new contacts
3. **Analytics** — Track contact acquisition rates and sources
4. **Data Enrichment** — Look up additional information about the contact from external services
5. **Compliance Tracking** — Log new contacts for audit trails

## CONTACT_UPDATE

### When It Fires

- Contact information updated via API (`PATCH /v1/projects/{project_id}/contacts/{contact_id}`)
- Changes to: display name, email, external_id, metadata, language, or channel identities

### Callback Structure

```json
{
  "app_id": "01H1234567...",
  "accepted_time": "2024-06-15T15:30:00.456Z",
  "project_id": "PROJECT123",
  "contact_update_notification": {
    "contact": {
      "id": "01H3333333...",
      "channel_identities": [
        {
          "channel": "WHATSAPP",
          "identity": "46732001122",
          "app_id": "01H1234567..."
        },
        {
          "channel": "SMS",
          "identity": "15551234567",
          "app_id": "01H1234567..."
        }
      ],
      "display_name": "John Doe",
      "email": "john.doe+updated@example.com",
      "external_id": "customer_12345",
      "metadata": "{\"tier\":\"premium\",\"last_purchase\":\"2024-06-10\"}",
      "language": "EN"
    }
  }
}
```

### Key Fields

Same as `CONTACT_CREATE`, but represents the updated state after the change.

### Common Use Cases

1. **CRM Sync** — Update corresponding records in external systems
2. **Channel Addition Detection** — Detect when new channel identities are added (e.g., customer provided email after starting with SMS)
3. **Metadata Change Triggers** — React to metadata changes (e.g., customer upgraded to premium tier)
4. **Audit Logging** — Track all contact modifications for compliance
5. **Cache Invalidation** — Clear cached contact data when updates occur

## CONTACT_DELETE

### When It Fires

- Contact explicitly deleted via API (`DELETE /v1/projects/{project_id}/contacts/{contact_id}`)
- Never fires automatically

### Callback Structure

```json
{
  "app_id": "01H1234567...",
  "accepted_time": "2024-06-15T16:00:00.789Z",
  "project_id": "PROJECT123",
  "contact_delete_notification": {
    "contact_id": "01H3333333..."
  }
}
```

### Key Fields

| Field        | Description               |
| ------------ | ------------------------- |
| `contact_id` | ID of the deleted contact |

Note: Only the contact ID is provided; the contact is already deleted.

### Common Use Cases

1. **GDPR Compliance** — Remove contact from external databases when deleted from Conversation API
2. **CRM Cleanup** — Delete or archive corresponding records in CRM systems
3. **Audit Trail** — Log deletion events for compliance reporting
4. **Cache Cleanup** — Remove contact from application caches
5. **Reference Cleanup** — Update or remove contact references in related records

## CONTACT_MERGE

### When It Fires

- Two contacts merged via API (`POST /v1/projects/{project_id}/contacts:merge`)
- Typically used to consolidate duplicate contacts

### Callback Structure

```json
{
  "app_id": "01H1234567...",
  "accepted_time": "2024-06-15T17:00:00.123Z",
  "project_id": "PROJECT123",
  "contact_merge_notification": {
    "deleted_contact_id": "01H4444444...",
    "preserved_contact": {
      "id": "01H3333333...",
      "channel_identities": [
        {
          "channel": "WHATSAPP",
          "identity": "46732001122",
          "app_id": "01H1234567..."
        },
        {
          "channel": "SMS",
          "identity": "15551234567",
          "app_id": "01H1234567..."
        }
      ],
      "display_name": "John Doe",
      "email": "john.doe@example.com",
      "external_id": "customer_12345",
      "metadata": "",
      "language": "EN"
    }
  }
}
```

### Key Fields

| Field                | Description                                          |
| -------------------- | ---------------------------------------------------- |
| `deleted_contact_id` | ID of the contact that was deleted during merge      |
| `preserved_contact`  | Full details of the contact that remains after merge |

### Common Use Cases

1. **CRM Merge** — Merge corresponding duplicate records in your CRM
2. **Data Consolidation** — Combine conversation history and analytics from both contacts
3. **Reference Updates** — Update all references to `deleted_contact_id` to point to `preserved_contact.id`
4. **Duplicate Resolution** — Resolve duplicate detection issues flagged by `CONTACT_IDENTITIES_DUPLICATION`
5. **Audit Logging** — Track merge operations for data quality monitoring

## CONTACT_IDENTITIES_DUPLICATION

### When It Fires

- Same channel identity (e.g., phone number) assigned to multiple contacts
- Automatic detection when channel identity conflict occurs
- Can happen when importing contacts from external systems

### Callback Structure

```json
{
  "app_id": "01H1234567...",
  "accepted_time": "2024-06-15T18:00:00.456Z",
  "project_id": "PROJECT123",
  "duplicated_identities_notification": {
    "duplicated_channel_identities": [
      {
        "channel": "SMS",
        "identity": "15551234567",
        "app_id": "01H1234567...",
        "contact_ids": ["01H3333333...", "01H4444444..."]
      }
    ]
  }
}
```

### Key Fields

| Field                           | Description                                         |
| ------------------------------- | --------------------------------------------------- |
| `duplicated_channel_identities` | Array of duplicate identity entries                 |
| `channel`                       | Channel where duplication occurred                  |
| `identity`                      | The duplicate channel identity (e.g., phone number) |
| `contact_ids`                   | Array of contact IDs sharing this identity          |

### Common Use Cases

1. **Data Quality Alerts** — Alert administrators when duplicates are detected
2. **Automatic Merge Triggers** — Automatically merge contacts with duplicate identities
3. **Manual Review Queue** — Add to queue for manual review and resolution
4. **Import Validation** — Detect issues during bulk contact imports
5. **Audit Logging** — Track data quality issues for compliance

## Key Points

### CONTACT_CREATE

1. **Auto-Create** — Can fire automatically when first message received from unknown identity (if enabled in app settings)
2. **Channel Identities** — New contacts must have at least one channel identity
3. **External ID** — Use `external_id` to link to your system's contact identifier

### CONTACT_UPDATE

4. **Partial Updates** — Callback includes full contact details, but only changed fields were updated
5. **Channel Identity Changes** — Adding or removing channel identities triggers this notification
6. **Metadata Changes** — Any metadata modification fires this trigger; use to track custom contact state

### CONTACT_DELETE

7. **Permanent Deletion** — Contact cannot be recovered after deletion
8. **Conversation Impact** — Existing conversations with deleted contact remain but are orphaned
9. **Manual Only** — Never fires automatically; requires explicit API call

### CONTACT_MERGE

10. **Preserved Contact** — All channel identities, conversations, and messages moved to preserved contact
11. **Deleted Contact** — The `deleted_contact_id` is permanently removed
12. **Merge Strategy** — Preserved contact's metadata and display_name take precedence; consider merging metadata manually if needed

### CONTACT_IDENTITIES_DUPLICATION

13. **Data Quality Alert** — This is a warning, not an error; the system allows duplicates but flags them
14. **Resolution Required** — Use `CONTACT_MERGE` to resolve duplicates
15. **Import Validation** — Check for this notification after bulk imports to catch issues early
16. **Multiple Duplicates** — One notification can contain multiple duplicate entries if several identities are duplicated
