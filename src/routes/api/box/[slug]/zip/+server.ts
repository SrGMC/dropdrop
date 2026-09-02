import { resolveBoxPath } from '$lib/files/paths';
import { error } from '@sveltejs/kit';
import fs from 'fs';
import { ZipArchive } from 'archiver';

export async function POST({ params, request }): Promise<Response> {
	const boxId: string = params.slug;

	let paths: string[][];
	try {
		const body = await request.json();
		if (!Array.isArray(body.paths)) throw new Error();
		paths = body.paths;
	} catch {
		throw error(400, 'Expected { paths: string[][] }');
	}

	const entries: { fullPath: string; name: string; isDir: boolean }[] = [];

	for (const segments of paths) {
		if (!Array.isArray(segments) || segments.length === 0) continue;
		const fullPath = resolveBoxPath(boxId, segments);
		if (!fs.existsSync(fullPath)) continue;
		const stat = fs.statSync(fullPath);
		entries.push({
			fullPath,
			name: segments[segments.length - 1],
			isDir: stat.isDirectory()
		});
	}

	if (entries.length === 0) throw error(400, 'No valid paths');

	const zipName = boxId;

	const body = new ReadableStream({
		start(controller) {
			const archive = new ZipArchive({ zlib: { level: 6 } });
			archive.on('data', (chunk: Buffer) => controller.enqueue(chunk));
			archive.on('end', () => controller.close());
			archive.on('error', (err: Error) => controller.error(err));

			for (const entry of entries) {
				if (entry.isDir) {
					archive.directory(entry.fullPath, entry.name);
				} else {
					archive.file(entry.fullPath, { name: entry.name });
				}
			}

			archive.finalize();
		}
	});

	return new Response(body, {
		headers: {
			'Content-Type': 'application/zip',
			'Content-Disposition': `attachment; filename="${zipName}.zip"`
		}
	});
}
