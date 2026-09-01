import { getMimeTypeInfo } from './common';
import { resolveBoxPath } from './paths';
import { error } from '@sveltejs/kit';
import { marked } from 'marked';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import mime from 'mime';
import sanitizeHtml from 'sanitize-html';
import type { Directory, File } from '../types';

/** True if the box-relative path exists and is a directory; throws 404 if it does not exist. */
export function isDirectory(boxId: string, path: string[]) {
	const fullPath = resolveBoxPath(boxId, path);
	if (fs.existsSync(fullPath)) {
		return fs.statSync(fullPath).isDirectory();
	} else {
		throw error(404, 'Not found');
	}
}

export function listDirectory(boxId: string, path: string[]): Array<File | Directory> {
	const basePath = resolveBoxPath(boxId, path);
	if (fs.existsSync(basePath)) {
		const dirList = fs.readdirSync(basePath).sort();
		const fileList: Array<File | Directory> = [];

		for (let i = 0; i < dirList.length; i++) {
			const file = dirList[i];
			const baseFilePath = resolveBoxPath(boxId, [...path, file]);

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

const README_SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
	allowedTags: [
		'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
		'p', 'br', 'hr',
		'strong', 'em', 'b', 'i', 'del', 's',
		'code', 'pre',
		'ul', 'ol', 'li',
		'a', 'img',
		'table', 'thead', 'tbody', 'tr', 'th', 'td',
		'blockquote'
	],
	allowedAttributes: {
		a: ['href', 'title'],
		img: ['src', 'alt', 'title'],
		th: ['align'],
		td: ['align'],
		code: ['class'],
		pre: ['class']
	},
	allowedSchemes: ['http', 'https', 'mailto'],
	allowedSchemesByTag: {
		img: ['http', 'https']
	}
};

export function loadReadme(boxId: string, path: string[]) {
	const fullPath = resolveBoxPath(boxId, path, 'README.md');
	if (fs.existsSync(fullPath) && !fs.statSync(fullPath).isDirectory()) {
		return sanitizeHtml(marked.parse(fs.readFileSync(fullPath).toString('utf8')) as string, README_SANITIZE_OPTIONS);
	} else {
		return '';
	}
}

export function getFile(boxId: string, path: string[], base64 = true) {
	const fullPath = resolveBoxPath(boxId, path);
	if (fs.existsSync(fullPath)) {
		if (fs.statSync(fullPath).isDirectory()) {
			throw error(400, 'Path is directory');
		}

		if (base64) {
			return fs.readFileSync(fullPath).toString('base64');
		} else {
			return fs.readFileSync(fullPath).toString('utf8');
		}
	} else {
		throw error(404, 'Not found');
	}
}
