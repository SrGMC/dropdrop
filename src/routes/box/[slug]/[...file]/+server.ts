import { buildPath } from '$lib/files/common';
import { error } from '@sveltejs/kit';
import fs from 'fs';
import archiver_ from 'archiver';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const archiver = (archiver_ as any).default ?? archiver_;
import { Readable } from 'stream';

export async function GET({ params, url }): Promise<Response> {
	if (!url.searchParams.has('zip')) {
		throw error(400, 'Missing zip parameter');
	}

	const boxId: string = params.slug;
	const path: string[] = params.file.split('/');
	const fullPath: string = `./files${buildPath(boxId, path, undefined, false)}`;

	if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isDirectory()) {
		throw error(404, 'Directory not found');
	}

	const folderName = path[path.length - 1];

	const body = new ReadableStream({
		start(controller) {
			const archive = archiver('zip', { zlib: { level: 6 } });

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
}

export async function POST({ params, request }): Promise<Response> {
	const boxId: string = params.slug;
	const path: string[] = params.file.split('/');
	const fullPath: string = buildPath(boxId, path, undefined, false);

	if (!request.body) {
		fs.mkdirSync(`./files/${fullPath}`, { recursive: true });
	} else {
		const formData = await request.formData();
		if (formData.has('file')) {
			const fileFormDataEntry: FormDataEntryValue = <FormDataEntryValue>formData.get('file');
			const fileBlob: Blob = <Blob>fileFormDataEntry.valueOf();

			if (fileBlob.size > 100 * 1024 * 1024) {
				throw error(413, 'File exceeds maximum 100MB size.');
			}

			const arrayBuffer: ArrayBuffer = await fileBlob.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);
			fs.writeFileSync(`./files/${fullPath}`, buffer);
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
	const fullPath: string = buildPath(boxId, path, undefined, false);

	if (!fs.existsSync(`./files/${fullPath}`)) {
		throw error(404, 'File or folder not exist');
	}

	fs.rmSync(`./files/${fullPath}`, { recursive: true, force: true });

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
