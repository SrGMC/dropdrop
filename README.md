# DropDrop

Temporary file sharing. Create a box, drop files in, share the link.

No accounts. Access is gated by the box ID — a short passphrase slug in the URL. Empty boxes are automatically deleted after 15 days.

## Features

- Upload files and folders via drag and drop or file picker
- Preview images, PDFs, plain text, and markdown inline
- Navigate between files with arrow keys
- Download folders as ZIP
- README.md files render at the bottom of each directory

## Running with Docker

```bash
docker run -p 3000:3000 -v $(pwd)/files:/app/files ghcr.io/srgmc/dropdrop
```

Set `ORIGIN` to your public URL in production:

```bash
docker run -p 3000:3000 -e ORIGIN=https://example.com -v $(pwd)/files:/app/files ghcr.io/srgmc/dropdrop
```

## Development

```bash
npm install
npm run dev
```

## Building

```bash
npm run build
node build
```
