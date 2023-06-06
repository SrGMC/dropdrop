import { error } from '@sveltejs/kit';
import fs from 'fs';
import mime from 'mime-types';
import type { File } from '../types';
import { buildPath, getMimeTypeInfo } from './common';

export function isDirectory(path: string, prefix: string = '') {
	if (fs.existsSync(`${prefix}${path}`)) {
		const fileStat = fs.statSync(`${prefix}${path}`);
		return fileStat.isDirectory();
	} else {
		throw error(404, 'Not found');
	}
}

export function listDirectory(boxId: string, path: string[], prefix: string = '') {
	const basePath = `${prefix}${buildPath(boxId, path, undefined, false)}`;
	if (fs.existsSync(basePath)) {
		const dirList = fs.readdirSync(basePath).sort();
		const fileList: File[] = [];

		for (let i = 0; i < dirList.length; i++) {
			const file = dirList[i];
			const baseFilePath = `${basePath}/${file}`;

			const fileStat = fs.statSync(baseFilePath);
			const isDirectory = fileStat.isDirectory();
			fileList.push({
				type: 'file',
				id: i,
				boxId: boxId,
				name: file,
				mime: getMimeTypeInfo(isDirectory ? 'dir' : <string>mime.lookup(baseFilePath)),
				size: isDirectory ? 0 : fileStat.size,
				path: [...path, file]
			});
		}

		return fileList;
	} else {
		throw error(404, 'Not found');
	}
}

export function getFile(path: string, prefix: string = '') {
	if (fs.existsSync(`${prefix}${path}`)) {
		const fileStat = fs.statSync(`${prefix}${path}`);
		if (isDirectory(path, prefix)) {
			throw error(400, 'Path is directory');
		}

		return fs.readFileSync(`${prefix}${path}`).toString('base64');
	} else {
		throw error(404, 'Not found');
	}
}
