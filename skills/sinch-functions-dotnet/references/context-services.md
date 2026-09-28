> **Summary — not the spec.** This file orients you and links to the authoritative
> `developers.sinch.com` doc; it may lag, omit fields, or simplify nesting. Do **not**
> copy field names, nesting, encodings, or enums from here into shipped code without
> confirming them in the linked doc. See "Source of Truth" in this skill's SKILL.md.

# FunctionContext services — Cache, Storage, Database (C#)

Reference for the persistence and state services on `FunctionContext`. Loaded on-demand from
[SKILL.md](../SKILL.md). For the bundled Sinch SDK clients (`Context.Voice`, `Context.Conversation`,
`Context.Sms`, `Context.Numbers`, and any other product), see "The bundled SDK" in SKILL.md, the
`sinch-sdks` skill, and the product skill.

All three services are injected into every controller via `FunctionContext` (`Context.Cache`, `Context.Storage`, `Context.Database`). In development they use local in-memory or filesystem backends; in production they are persistent and durable.

## Cache (`IFunctionCache`)

Key-value store with optional TTL (default 3600s), JSON-serialized. In dev: in-memory, lost on restart. In prod: persistent, shared across instances. `Set`, `Get<T>`, `Exists`, `Delete`, `GetKeys`.

```csharp
await Context.Cache.Set($"call:{call.CallId}:cli", call.FromNumber ?? "unknown", 3600);
var cli = await Context.Cache.Get<string>($"call:{call.CallId}:cli");
```

## Storage (`IFunctionStorage`)

File/blob storage. In dev: local filesystem (`./storage/`). In prod: S3-backed with a local disk read cache. Keys can include path separators. `WriteAsync`/`ReadAsync`/`ReadTextAsync`/`ReadStreamAsync` (byte array, string, and stream overloads), `ListAsync(prefix?)`, `ExistsAsync`, `DeleteAsync`.

```csharp
await Context.Storage.WriteAsync("reports/daily.json", JsonSerializer.Serialize(data));
var content = await Context.Storage.ReadTextAsync("reports/daily.json");
```

## Database (`IFunctionDatabase`)

`Context.Database.ConnectionString` gives you a SQLite connection string — bring your own SQLite library (`Microsoft.Data.Sqlite`, optionally with Dapper). In production, the database is durable and replicated automatically, with no code changes.

```csharp
using Microsoft.Data.Sqlite;

using var conn = new SqliteConnection(Context.Database.ConnectionString);
conn.Open();
using var cmd = conn.CreateCommand();
cmd.CommandText = "INSERT INTO call_log (caller, ts) VALUES ($caller, $ts)";
cmd.Parameters.AddWithValue("$caller", call.FromNumber ?? "unknown");
cmd.Parameters.AddWithValue("$ts", DateTimeOffset.UtcNow.ToUnixTimeSeconds());
cmd.ExecuteNonQuery();
```

## Related

- [.NET skill](../SKILL.md) — full runtime overview
- [conversation.md](conversation.md) — messaging webhooks
- [Function context reference](https://developers.sinch.com/docs/functions/reference/function-context.md)
