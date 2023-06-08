import { listDirectory, loadReadme } from '$lib/files/node';

export const prerender = false;

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, url }) {
	const boxId: string = params.slug;

	const list = listDirectory(boxId, [], './files');
	const readme = loadReadme(boxId, []);
	return {
		boxId: boxId,
		path: [],
		files: list,
		readme: readme
	};
}
