# 0002. Filesystem as storage backend

## Status
Accepted

## Context
Boxes need durable storage for arbitrary file trees (nested folders, arbitrary file types/sizes up to the configured cap). No relational data is queried beyond "list this directory" / "read this file" / "write this file" / "delete this path".

## Decision
Boxes are stored as plain directories under `./files/<boxId>/...` on the server's local disk. No database, no object store (S3-compatible or otherwise). All operations (`src/lib/files/node.ts`, `src/routes/box/[slug]/[...file]/+server.ts`) go straight through Node's `fs` module: `fs.readdirSync`, `fs.writeFileSync`, `fs.rmSync`, etc. Directory listing IS the data model — a Box's file tree is derived at request time by walking the filesystem, not read from an index.

## Consequences
- Trivially simple to reason about and back up (it's just files) — no schema, no migrations, no query layer.
- Ties deployment to a single machine/volume with persistent local disk — no horizontal scaling of the app server without a shared filesystem (NFS-style) or a rewrite to an object store.
- No atomic multi-file operations, no transactional guarantees — a crash mid-write can leave a Box in a partial state.
- Listing large directories means a full `readdirSync` + per-entry `statSync` on every page load — fine at low file counts, becomes the bottleneck before anything else does.
- Migrating to a DB/object-store backend later means rewriting the entire `files/*` module and re-ingesting every existing Box's on-disk tree.
