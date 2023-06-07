import { writable, type Writable } from 'svelte/store';
import { buildPath } from './common';

export let openCreateFolderModal = writable(false);
export let errors: Writable<{ id: number, name: string; type: 'size' | 'upload' }[]> = writable([]);

export function downloadBase64AsFile(base64: string, filename: string) {
	// Create an anchor element
	var link = document.createElement('a');
	link.href = 'data:application/octet-stream;base64,' + base64;
	link.download = filename;

	// Simulate a click on the anchor element to trigger the download
	link.click();
}

export async function uploadFiles(files: any, boxId: string, path: string[]) {
	let result = true;
	for (let i = 0; i < files.length; i++) {
		const file = files[i];
		const formData = new FormData();
		formData.append('file', file, file.name);

		try {
			await fetch(buildPath(boxId, path, file.name), {
				method: 'POST',
				body: formData
			});
		} catch (err) {
			result = false;
			console.log('uploadFiles', err);
			continue;
		}
	}

	return result;
}

export async function uploadFile(file: any, boxId: string, path: string[]) {
	let result = true;
	const formData = new FormData();
	formData.append('file', file, file.name);

	try {
		await fetch(buildPath(boxId, path, file.name), {
			method: 'POST',
			body: formData
		});
	} catch (err) {
		result = false;
		console.log('uploadFiles', err);
	}

	return result;
}

export async function deleteFileOrFolder(boxId: string, path: string[]) {
	let result = true;
	try {
		await fetch(buildPath(boxId, path), {
			method: 'DELETE'
		});
	} catch (err) {
		result = false;
		console.log('deleteFileOrFolder', err);
	}
}
