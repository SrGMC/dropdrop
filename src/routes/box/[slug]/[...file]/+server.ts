import { buildPath } from '$lib/files.js';
import fs from 'fs';
import { Readable } from 'stream';

async function convertStreamToBuffer(stream: any): Promise<Uint8Array> {
	const chunks: any[] = [];
  
	return new Promise((resolve, reject) => {
	  stream.on('data', (chunk: any) => chunks.push(chunk));
	  stream.on('end', () => {
		try {
		  const concatenatedChunks = Uint8Array.from(chunks.flat());
		  resolve(concatenatedChunks);
		} catch (error) {
		  reject(error);
		}
	  });
	  stream.on('error', reject);
	});
  }

export async function POST({params, request}): Promise<Response> {
	const boxId: string = params.slug;
	const path: string[] = params.file.split('/');
	const fullPath: string = buildPath(boxId, path, undefined, false);
    
    if(!request.body) {
        fs.mkdirSync(`${process.cwd()}/files/${fullPath}`, { recursive: true });
    } else {
		const fileBlob: string = <string>(await request.formData()).get('file')?.toString()
		fs.writeFileSync(`${process.cwd()}/files/${fullPath}`, fileBlob);
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