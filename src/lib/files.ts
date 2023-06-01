import { error } from '@sveltejs/kit';
import fs from 'fs';
import mime from 'mime-types';
import mimes from './mime.json';
import { writable } from 'svelte/store';
import type { File, MimeType } from './types';

export let openCreateFolderModal = writable(false);

export function buildPath(boxId: string, pathArray: string[], file?: string, addBox: boolean = true) {
	pathArray.filter((path) => path != undefined && path != null && path.trim() != '');
	let basePath = `${addBox ? '/box' : ''}/${boxId}`;

	if (pathArray.length > 0){
		basePath += `/${pathArray.join('/')}`
	}

	if (file) {
		return basePath + '/' + file;
	} else {
		return basePath;
	}
}

export function getMimeTypeInfo(mime: string): MimeType {
	const info = mimes.find((m) => m.mime == mime);
	return info ? info : { mime: mime, name: 'Document', type: 'text' };
}

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
	console.log('listDirectory()', boxId, path, basePath)
	console.log(basePath, boxId, path);
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

		console.log(fileList);

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

export function downloadBase64AsFile(base64: string, filename: string) {
	// Create an anchor element
	var link = document.createElement('a');
	link.href = 'data:application/octet-stream;base64,' + base64;
	link.download = filename;

	// Simulate a click on the anchor element to trigger the download
	link.click();
}
