import { error } from '@sveltejs/kit';
import fs from 'fs';
import mime from 'mime-types';
import mimes from './mime.json';

export function getMimeTypeInfo(mime: string) {
	const info = mimes.find((m) => m.mime == mime);
	return info ? info : { mime: mime, name: 'Document', type: 'text' };
}

export async function listDirectory(path: string, prefix: string = '') {
	if (fs.existsSync(`${prefix}${path}`)) {
		const dirList = fs.readdirSync(`${prefix}${path}`);
		const fileList = [];

		for (let i = 0; i < dirList.length; i++) {
			const file = dirList[i];
			const filePath = `${path}/${file}`;

			const fileStat = fs.statSync(`${prefix}${filePath}`);
			const isDirectory = fileStat.isDirectory();
			fileList.push({
				id: i,
				name: file,
				type: getMimeTypeInfo(isDirectory ? 'dir' : <string>mime.lookup(`${prefix}/${filePath}`)),
				size: isDirectory ? 0 : fileStat.size,
				path: filePath
			});
		}

		return fileList;
	} else {
		throw error(404, 'Not found');
	}
}
