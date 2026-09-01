import { resolveBoxPath } from '$lib/files/paths';
import { error } from '@sveltejs/kit';
import fs from 'fs';
import mime from 'mime';
import { ZipArchive } from 'archiver';

export async function GET({ params, url }): Promise<Response> {
	const boxId: string = params.slug;
	const path: string[] = params.file.split('/');
	const fullPath: string = resolveBoxPath(boxId, path);

	if (!fs.existsSync(fullPath)) {
		throw error(404, 'Not found');
	}

	const stat = fs.statSync(fullPath);

	if (stat.isDirectory()) {
		if (!url.searchParams.has('zip')) {
			throw error(400, 'Missing zip parameter');
		}

		const folderName = (path[path.length - 1] || boxId).replace(/[^\w.\- ]/g, '_');

		const body = new ReadableStream({
			start(controller) {
				const archive = new ZipArchive({ zlib: { level: 6 } });
				archive.on('data', (chunk: Buffer) => controller.enqueue(chunk));
				archive.on('end', () => controller.close());
				archive.on('error', (err: Error) => controller.error(err));
				archive.directory(fullPath, folderName);
				archive.finalize();
			}
		});

		return new Response(body, {
			headers: {
				'Content-Type': 'application/zip',
				'Content-Disposition': `attachment; filename="${folderName}.zip"`
			}
		});
	} else {
		// Stream the file. <img>, <embed>, and fetch() all reach here because they
		// don't include text/html in Accept, so SvelteKit skips the page route.
		const filename = path[path.length - 1];
		const mimeType = mime.getType(fullPath) || 'application/octet-stream';

		const headers: Record<string, string> = {
			'Content-Type': mimeType,
			'Content-Length': String(stat.size)
		};

		if (url.searchParams.has('download')) {
			// Strip chars that would break the quoted filename value.
			const safeName = filename.replace(/["\\]/g, '_');
			headers['Content-Disposition'] = `attachment; filename="${safeName}"`;
		}

		const body = new ReadableStream({
			start(controller) {
				const stream = fs.createReadStream(fullPath);
				stream.on('data', (chunk) => controller.enqueue(chunk));
				stream.on('end', () => controller.close());
				stream.on('error', (err) => controller.error(err));
			}
		});

		return new Response(body, { headers });
	}
}

export async function POST({ params, request }): Promise<Response> {
	const boxId: string = params.slug;
	const path: string[] = params.file.split('/');
	const fullPath: string = resolveBoxPath(boxId, path);

	if (!request.body) {
		fs.mkdirSync(fullPath, { recursive: true });
	} else {
		const formData = await request.formData();
		if (formData.has('file')) {
			const fileFormDataEntry: FormDataEntryValue = <FormDataEntryValue>formData.get('file');
			const fileBlob: Blob = <Blob>fileFormDataEntry.valueOf();

			if (fileBlob.size > 100 * 1024 * 1024) {
				throw error(413, 'File exceeds maximum 100MB size.');
			}

			// Never let an upload overwrite (or write "through") an existing directory.
			if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
				throw error(409, 'A directory with that name already exists');
			}

			const arrayBuffer: ArrayBuffer = await fileBlob.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);
			fs.writeFileSync(fullPath, buffer);
		} else {
			throw error(400, "Missing form data parameter 'file'");
		}
	}

	return new Response(
		JSON.stringify({
			path: path
		}),
		{
			headers: {
				'Content-Type': 'application/json'
			}
		}
	);
}

export async function DELETE({ params }): Promise<Response> {
	const boxId: string = params.slug;
	const path: string[] = params.file.split('/');
	const fullPath: string = resolveBoxPath(boxId, path);

	if (!fs.existsSync(fullPath)) {
		throw error(404, 'File or folder not exist');
	}

	fs.rmSync(fullPath, { recursive: true, force: true });

	return new Response(
		JSON.stringify({
			status: true
		}),
		{
			headers: {
				'Content-Type': 'application/json'
			}
		}
	);
}
