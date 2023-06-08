<script lang="ts">
	import { buildPath } from '$lib/files/common';
	import type { MimeType } from '$lib/types';
	import {
		DocumentBlank,
		Music,
		TextFont,
		Video,
		Book,
		DocumentPdf,
		PresentationFile,
		TableSplit,
		Archive,
		Folder,
		Image,
		Document
	} from 'carbon-icons-svelte';

	export let boxId: string;
	export let path: string[];
	export let name: string;
	export let mime: MimeType;
</script>

<a
	href={buildPath(boxId, path, name)}
	class="bx--link"
	target={mime.type == 'dir' ? '_self' : '_blank'}
	data-sveltekit-reload
>
	{#if mime.type == 'application'}
		<DocumentBlank /> {name}
	{:else if mime.type == 'audio'}
		<Music /> {name}
	{:else if mime.type == 'font'}
		<TextFont /> {name}
	{:else if mime.type == 'image'}
		<Image /> {name}
	{:else if mime.type == 'text'}
		<Document /> {name}
	{:else if mime.type == 'video'}
		<Video />{name}
	{:else if mime.type == 'epub'}
		<Book />{name}
	{:else if mime.type == 'pdf'}
		<DocumentPdf />{name}
	{:else if mime.type == 'powerpoint'}
		<PresentationFile />{name}
	{:else if mime.type == 'excel'}
		<TableSplit />{name}
	{:else if mime.type == 'word'}
		<Document />{name}
	{:else if mime.type == 'archive'}
		<Archive />{name}
	{:else if mime.type == 'dir'}
		<Folder />{name}
	{:else}
		<DocumentBlank /> {name}
	{/if}
</a>
