import { addError, deleteFileOrFolder, setStateAttribute, uploadFile } from '$lib/files/browser';
import { getMimeTypeInfo, buildPath } from '$lib/files/common';
import { v4 as uuidv4 } from 'uuid';
import type { File } from '$lib/types';

export async function upload(
	currentFiles: File[],
	inputFiles: any[],
	boxId: string,
	path: string[],
	dispatch: any
) {
	let newFiles: File[] = [];
	for (let i = 0; i < inputFiles.length; i++) {
		const file = inputFiles[i];
		console.log(file);
		if (file.size > 100 * 1024 * 1024) {
			addError(file.name, 'size');
		} else {
			const result = await uploadFile(file, boxId, path);
			if (result) {
				const existingFile = currentFiles.find((f) => f.name == file.name);
				if (!existingFile) {
					newFiles.push({
						id: uuidv4(),
						type: 'file',
						boxId: boxId,
						path: [...path, file.name],
						name: file.name,
						mime: getMimeTypeInfo(file.type),
						size: file.size
					});
				} else {
					existingFile.size = file.size;
				}
			} else if (!result) {
				addError(file.name, 'upload');
			}

			setStateAttribute('progress', ((i + 1) / inputFiles.length) * 100);
		}
	}

	dispatch('upload', newFiles);
}

export async function remove(
	currentFiles: File[],
	selectedIds: string[],
	boxId: string,
	dispatch: any
) {
	const result = [];
	for (let i = 0; i < selectedIds.length; i++) {
		const id = selectedIds[i];
		const file = currentFiles.find((f) => f.id == id);
		if (file) {
			// TODO: Add try-catch
			await deleteFileOrFolder(boxId, file.path);
			result.push(id);
		}
	}

	dispatch('remove', result);
}

export async function download(
	currentFiles: File[],
	selectedIds: string[],
	boxId: string,
	url: URL
) {
	for (let i = 0; i < selectedIds.length; i++) {
		const id = selectedIds[i];
		const file = currentFiles.find((f) => f.id == id);
		if (file) {
			window.open(`${url.protocol}//${url.host}${buildPath(boxId, file.path)}?download=true`);
		}
	}
}
