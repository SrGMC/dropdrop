import { listDirectory } from '$lib/files';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, url }) {
	const boxId: string = params.slug;
	const file: string = params.file;
	const fullPath: string = `/${boxId}/${file}`;

	return {
		boxId: boxId,
		path: `/box/${boxId}/${file}`,
		files: await listDirectory(fullPath, './files')
	};
}
