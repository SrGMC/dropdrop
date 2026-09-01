import type { Handle } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';

const FILES_ROOT = path.resolve('files');
const MAX_EMPTY_AGE_MS = 15 * 24 * 60 * 60 * 1000; // 15 days

function cleanupEmptyBoxes() {
	if (!fs.existsSync(FILES_ROOT)) return;

	let entries: string[];
	try {
		entries = fs.readdirSync(FILES_ROOT);
	} catch {
		return;
	}

	for (const entry of entries) {
		const boxPath = path.join(FILES_ROOT, entry);
		try {
			const stat = fs.statSync(boxPath);
			if (!stat.isDirectory()) continue;

			const contents = fs.readdirSync(boxPath);
			if (contents.length > 0) continue;

			const ageMs = Date.now() - stat.mtimeMs;
			if (ageMs > MAX_EMPTY_AGE_MS) {
				fs.rmdirSync(boxPath);
				console.log(`[dropdrop] Removed empty box after 15 days: ${entry}`);
			}
		} catch {
			// Skip boxes we can't stat or remove; log nothing to avoid noise.
		}
	}
}

// Run once at startup, then every 6 hours.
cleanupEmptyBoxes();
setInterval(cleanupEmptyBoxes, 6 * 60 * 60 * 1000);

export const handle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);

	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('Referrer-Policy', 'no-referrer');
	response.headers.set(
		'Content-Security-Policy',
		[
			"default-src 'self'",
			"script-src 'self' 'unsafe-inline'",
			"style-src 'self' 'unsafe-inline'",
			"img-src 'self' data: blob:",
			"font-src 'self'",
			"object-src 'self'",
			"frame-ancestors 'none'",
			"form-action 'self'",
			"base-uri 'self'"
		].join('; ')
	);
	response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

	return response;
};
