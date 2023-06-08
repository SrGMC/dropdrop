export type Node = {
	id: string;
	type: 'dir' | 'file';
	boxId: string;
	path: string[];
	name: string;
};

export type Directory = Node & {
	type: 'dir';
	files: File[];
	readme?: string;
};

export type File = Node & {
	type: 'file';
	base64?: string;
	mime?: MimeType;
	size?: number;
};

export type MimeType = {
	mime: string;
	name: string;
	type: string;
};

export type FileTableState = {
	uploading: boolean;
	deleting: boolean;
	progress: number;
};

export type ErrorNotification = {
	id: string;
	name: string;
	type: 'size' | 'upload';
};
