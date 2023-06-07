import { buildPath } from '$lib/files/common';
import { error } from '@sveltejs/kit';
import fs from 'fs';

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

			if (fileBlob.size > 10485760) {
				throw error(413, 'File exceeds maximum 10MB size.');
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
