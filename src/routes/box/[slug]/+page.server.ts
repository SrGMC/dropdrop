import { listDirectory } from '$lib/files/node';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, url }) {
	const boxId: string = params.slug;

	const list = listDirectory(boxId, [], './files');
	return {
		boxId: boxId,
		path: [],
		files: list
	};
}
