import { error } from '@sveltejs/kit';
import path from 'path';

/**
 * Server-side path resolution for Boxes.
 *
 * Every filesystem access MUST go through {@link resolveBoxPath} so that no
 * user-controlled input (the box slug or any path segment) can escape the
 * per-box directory. See docs/adr/0001-slug-based-access-control.md — the slug
 * is the sole access credential, so leaking access to arbitrary paths outside
 * `files/<boxId>/` would defeat the entire access model.
 */

// Absolute, canonical root that every Box lives under.
export const FILES_ROOT = path.resolve('files');

// A box id is a passphrase of dash-joined lowercase words
// (`generatePassphrase(4, DEFAULT_WORDLIST)`), e.g. `abacus-murky-hatchet-traitor`.
// Accept a conservative slug shape only: letters/digits joined by single dashes.
const BOX_ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/i;

// Control characters (incl. NUL) that must never appear in a path segment.
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/;

export function assertValidBoxId(boxId: unknown): string {
	if (
		typeof boxId !== 'string' ||
		boxId.length === 0 ||
		boxId.length > 128 ||
		!BOX_ID_RE.test(boxId)
	) {
		// Treat a malformed slug the same as a missing box: no oracle for probing.
		throw error(404, 'Not found');
	}
	return boxId;
}

// A single path segment: reject anything empty, "." / "..", too long, or
// containing a path separator or control character. Spaces and other printable
// characters in file names are fine.
function assertValidSegment(seg: unknown): void {
	if (
		typeof seg !== 'string' ||
		seg.length === 0 ||
		seg === '.' ||
		seg === '..' ||
		seg.length > 255 ||
		seg.includes('/') ||
		seg.includes('\\') ||
		CONTROL_CHARS.test(seg)
	) {
		throw error(400, 'Invalid path');
	}
}

/**
 * Resolve a box-relative path to an absolute filesystem path, guaranteeing the
 * result stays within `FILES_ROOT/<boxId>`. Throws 404 for a malformed slug and
 * 400 for any traversal attempt.
 */
export function resolveBoxPath(boxId: string, segments: string[] = [], file?: string): string {
	assertValidBoxId(boxId);

	const parts = (segments ?? []).filter((s) => s != null && s.trim() !== '');
	parts.forEach(assertValidSegment);
	if (file != null && file !== '') {
		assertValidSegment(file);
	}

	const boxRoot = path.join(FILES_ROOT, boxId);
	const full = path.resolve(boxRoot, ...parts, ...(file != null && file !== '' ? [file] : []));

	// Defense in depth: even if a check above is ever loosened, never leave the box root.
	if (full !== boxRoot && !full.startsWith(boxRoot + path.sep)) {
		throw error(400, 'Invalid path');
	}

	return full;
}
