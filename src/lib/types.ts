export type Node = {
	id: number;
	type: 'dir' | 'file';
	boxId: string;
	path: string[];
	name: string;
};

export type Directory = Node & {
	type: 'dir';
	files: File[];
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
};
