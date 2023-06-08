import { buildPath, getMimeTypeInfo } from './common';
import { error } from '@sveltejs/kit';
import { marked } from 'marked';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import mime from 'mime';
import sanitizeHtml from 'sanitize-html';
import type { Directory, File } from '../types';

export function isDirectory(path: string, prefix: string = '') {
	if (fs.existsSync(`${prefix}${path}`)) {
		const fileStat = fs.statSync(`${prefix}${path}`);
		return fileStat.isDirectory();
	} else {
		throw error(404, 'Not found');
	}
}

export function listDirectory(
	boxId: string,
	path: string[],
	prefix: string = ''
): Array<File | Directory> {
	const basePath = `${prefix}${buildPath(boxId, path, undefined, false)}`;
	if (fs.existsSync(basePath)) {
		const dirList = fs.readdirSync(basePath).sort();
		const fileList: Array<File | Directory> = [];

		for (let i = 0; i < dirList.length; i++) {
			const file = dirList[i];
			const baseFilePath = `${basePath}/${file}`;

			const fileStat = fs.statSync(baseFilePath);
			const isDirectory = fileStat.isDirectory();
			if (isDirectory) {
				fileList.push(<Directory>{
					type: isDirectory ? 'dir' : 'file',
					id: uuidv4(),
					boxId: boxId,
					name: file,
					mime: getMimeTypeInfo(isDirectory ? 'dir' : <string>mime.getType(baseFilePath)),
					size: isDirectory ? 0 : fileStat.size,
					path: [...path, file],
					files: []
				});
			} else {
				fileList.push(<File>{
					type: isDirectory ? 'dir' : 'file',
					id: uuidv4(),
					boxId: boxId,
					name: file,
					mime: getMimeTypeInfo(isDirectory ? 'dir' : <string>mime.getType(baseFilePath)),
					size: isDirectory ? 0 : fileStat.size,
					path: [...path, file]
				});
			}
		}

		return fileList;
	} else {
		throw error(404, 'Not found');
	}
}

export function loadReadme(boxId: string, path: string[]) {
	const fullPath = buildPath(boxId, path, 'README.md', false);
	if (fs.existsSync(`./files/${fullPath}`) && !isDirectory(`./files/${fullPath}`)) {
		return sanitizeHtml(marked.parse(getFile(fullPath, './files', false)));
	} else {
		return '';
	}
}

export function getFile(path: string, prefix: string = '', base64 = true) {
	if (fs.existsSync(`${prefix}${path}`)) {
		if (isDirectory(path, prefix)) {
			throw error(400, 'Path is directory');
		}

		if (base64) {
			return fs.readFileSync(`${prefix}${path}`).toString('base64');
		} else {
			return fs.readFileSync(`${prefix}${path}`).toString('utf8');
		}
	} else {
		throw error(404, 'Not found');
	}
}
