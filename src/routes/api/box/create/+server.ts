import fs from 'fs';
import { generatePassphrase } from 'secure-password-utilities';
import { DEFAULT_WORDLIST } from 'secure-password-utilities/wordlists';

export async function POST({}): Promise<Response> {
	const boxId = generatePassphrase(4, DEFAULT_WORDLIST);
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
