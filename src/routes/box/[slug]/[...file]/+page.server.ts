import { isDirectory, listDirectory, loadReadme } from '$lib/files/node';

export const prerender = false;

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
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
		// File content is streamed on demand via the GET handler in +server.ts.
		// Do not load base64 here — files can be up to 100 MB.
		return {
			type: 'file',
			boxId: boxId,
			name: path[path.length - 1],
			path: path
		};
	}
}
