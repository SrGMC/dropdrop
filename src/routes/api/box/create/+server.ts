import pkg from 'xkcd-passphrase';
const { xkcdPassphrase } = pkg;

import fs from 'fs';

export async function POST({}): Promise<Response> {
	const boxId = (await xkcdPassphrase.generateWithWordCount(4)).replace(/\s/g, '-');
	fs.mkdirSync(`${process.cwd()}/files/${boxId}`, { recursive: true });

	return new Response(
		JSON.stringify({
			boxId: boxId
		}),
		{
			headers: {
				'Content-Type': 'application/json'
			}
		}
	);
}
