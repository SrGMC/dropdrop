import mimes from './mime.json';
import type { MimeType } from '../types';

export function buildPath(
	boxId: string,
	pathArray: string[],
	file?: string,
	addBox: boolean = true
) {
	const segments = pathArray.filter(
		(path) => path != undefined && path != null && path.trim() != ''
	);
	let basePath = `${addBox ? '/box' : ''}/${boxId}`;

	if (segments.length > 0) {
		basePath += `/${segments.map(encodeURIComponent).join('/')}`;
	}

	if (file) {
		basePath = basePath + '/' + encodeURIComponent(file);
	}

	return basePath;
}

export function getMimeTypeInfo(mime: string): MimeType {
	const info = mimes.find((m) => m.mime == mime);
	return info ? info : { mime: mime, name: 'Document', type: 'text' };
}
