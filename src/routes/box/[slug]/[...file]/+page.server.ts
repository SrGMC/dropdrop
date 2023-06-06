import { getFile, isDirectory, listDirectory } from '$lib/files/node';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, url }) {
	const boxId: string = params.slug;
	const file: string = params.file;
	const fullPath: string = `/${boxId}/${file}`;

	if (isDirectory(fullPath, './files')) {
		const list = listDirectory(boxId, file.split('/'), './files');
		return {
			type: 'dir',
			boxId: boxId,
			path: file.split('/'),
			files: list
		};
	} else {
		return {
			type: 'file',
			boxId: boxId,
			name: fullPath.split('/').pop(),
			path: [...file.split('/'), file],
			base64: getFile(fullPath, './files')
		};
	}
}
