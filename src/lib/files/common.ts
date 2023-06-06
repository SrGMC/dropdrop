import mimes from './mime.json';
import type { MimeType } from '../types';

function sanitizeFilePath(path: string) {
	// Define a regular expression pattern to match invalid characters and Unicode control characters
	const invalidCharsRegex = /[<>:"|?*\u0000-\u001F\u007F-\u009F]/g;

	// Remove invalid characters from the file path
	const sanitizedPath = path.replace(invalidCharsRegex, '');

	return sanitizedPath;
}

export function buildPath(
	boxId: string,
	pathArray: string[],
	file?: string,
	addBox: boolean = true
) {
	pathArray.filter((path) => path != undefined && path != null && path.trim() != '');
	let basePath = `${addBox ? '/box' : ''}/${boxId}`;

	if (pathArray.length > 0) {
		basePath += `/${pathArray.join('/')}`;
	}

	if (file) {
		basePath = basePath + '/' + file;
	}

	return sanitizeFilePath(basePath);
}

export function getMimeTypeInfo(mime: string): MimeType {
	const info = mimes.find((m) => m.mime == mime);
	return info ? info : { mime: mime, name: 'Document', type: 'text' };
}
