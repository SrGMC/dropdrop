import { buildPath } from './common';
import { v4 as uuidv4 } from 'uuid';
import { writable, type Writable } from 'svelte/store';
import type { ErrorNotification, FileTableState } from '$lib/types';

export let openCreateFolderModal = writable(false);

export let internalState: FileTableState = {
	uploading: false,
	deleting: false,
	progress: 0
};
export let state: Writable<FileTableState> = writable(internalState);

export let internalErrors: ErrorNotification[] = [];
export let errors: Writable<ErrorNotification[]> = writable(internalErrors);

export function addError(name: string, type: 'size' | 'upload') {
	internalErrors.push({
		id: uuidv4(),
		name: name,
		type: type
	});
	errors.set(internalErrors);
}

export function resetErrors() {
	internalErrors = [];
	errors.set(internalErrors);
}

export function setStateAttribute(attribute: string, value: any) {
	//@ts-ignore
	internalState[attribute] = value;
	state.set(internalState);
}

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
