# 0003. Buffered upload with post-hoc size cap

## Status
Accepted

## Context
Uploads must be capped (currently 100MB, `src/routes/box/[slug]/[...file]/+server.ts:18`, raised from a lower limit in commit `5a005bb`) to bound disk/memory use per file, while keeping the upload code simple.

## Decision
The server reads the entire multipart body into a `FormData`/`Blob` (`await request.formData()`), THEN checks `fileBlob.size > 100 * 1024 * 1024` and rejects with 413 if over. The whole file is buffered in memory (`await fileBlob.arrayBuffer()` → `Buffer.from`) before `fs.writeFileSync` commits it to disk. There is no streaming, no early-abort on `Content-Length`, no chunked write.

## Consequences
- Simple, short implementation — one code path, no stream-error edge cases to handle.
- The size limit doesn't prevent the bad case it's meant to prevent: a client can upload up to (just under, or via a mismatched `Content-Length`, well past) the cap's worth of bytes, fully consuming memory and bandwidth, before the check even runs.
- Peak memory use per concurrent upload is close to the full file size (buffered twice-ish: FormData internals + `Buffer.from`), so raising the cap (as already happened once, 100MB) directly raises the server's memory ceiling under concurrent uploads — this is the real cost of "just bump the number," not just more disk.
- No partial-file cleanup path needed today since nothing is written until the buffer is complete — switching to streaming later would need to add explicit temp-file + rename-on-success handling to keep that guarantee.
