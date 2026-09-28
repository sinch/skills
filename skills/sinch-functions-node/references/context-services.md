> **Summary — not the spec.** This file orients you and links to the authoritative
> `developers.sinch.com` doc; it may lag, omit fields, or simplify nesting. Do **not**
> copy field names, nesting, encodings, or enums from here into shipped code without
> confirming them in the linked doc. See "Source of Truth" in this skill's SKILL.md.

# FunctionContext services — cache, storage, database (Node.js)

Reference for the cache/storage/database services on `FunctionContext`. Loaded on-demand from
[SKILL.md](../SKILL.md). For the bundled Sinch SDK clients (`context.voice`, `context.conversation`,
`context.sms`, `context.numbers`, and any other product), see "The bundled SDK" in SKILL.md, the
`sinch-sdks` skill, and the product skill.

## Cache

Key-value store. In dev: in-memory. In prod: persistent, shared across instances.

```typescript
await context.cache.set('session:abc', { userId: 'u1' }, 1800);  // TTL in seconds
const val = await context.cache.get<MyType>('session:abc');
await context.cache.has('key');
await context.cache.delete('key');
const keys = await context.cache.keys('session:*');
const values = await context.cache.getMany<MyType>(keys);  // batch read
await context.cache.extend('key', 600);  // extend TTL
```

Default TTL: 3600 seconds (1 hour).

## Storage

File/blob storage. In dev: `./storage/`. In prod: S3-backed.

```typescript
await context.storage.write('reports/daily.json', JSON.stringify(data));
const buf = await context.storage.read('reports/daily.json');
const files = await context.storage.list('reports/');
await context.storage.exists('file.txt');
await context.storage.delete('file.txt');
```

## Database

`context.database` is a path to a per-function SQLite database that is durable in production (continuously replicated behind the scenes — no code changes required). Use `sql.js` (recommended, no native deps) or `better-sqlite3`.

```typescript
import initSqlJs from 'sql.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';

const SQL = await initSqlJs();
const buf = existsSync(context.database) ? readFileSync(context.database) : undefined;
const db = new SQL.Database(buf);
db.run('CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY, value TEXT)');
// ... use db ...
writeFileSync(context.database, Buffer.from(db.export()));
db.close();
```

**`sql.js` needs async init** — `initSqlJs()` returns a Promise. Await it at the top of your handler or in a `setup()` startup hook; don't call it at module scope without top-level await.

## Links

- [Function context reference](https://developers.sinch.com/docs/functions/reference/function-context.md)
- [Context object](https://developers.sinch.com/docs/functions/functions/concepts/context-object.md)
- [Use the cache](https://developers.sinch.com/docs/functions/functions/guides/use-the-cache.md)
