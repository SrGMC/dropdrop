import { getFile, isDirectory, listDirectory, loadReadme } from '$lib/files/node';

export const prerender = false;

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, url }) {
	const boxId: string = params.slug;
	const file: string = params.file;
	const path = file.split('/');

	if (isDirectory(boxId, path)) {
		const list = listDirectory(boxId, path);
		const readme = loadReadme(boxId, path);
		return {
			type: 'dir',
			boxId: boxId,
			path: path,
			files: list,
			readme: readme
		};
	} else {
		return {
			type: 'file',
			boxId: boxId,
			name: path[path.length - 1],
			path: path,
			base64: getFile(boxId, path)
		};
	}
}
