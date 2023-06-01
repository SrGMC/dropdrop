import { listDirectory } from '$lib/files';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, url }) {
	const boxId: string = params.slug;
	const fullPath: string = `/${boxId}`;

	return {
		boxId: boxId,
		path: `/box/${boxId}`,
		files: await listDirectory(fullPath, './files')
	};
}
