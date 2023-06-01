<script lang="ts">
	import {
		DataTable,
		Toolbar,
		ToolbarContent,
		ToolbarSearch,
		Pagination,
		Breadcrumb
	} from 'carbon-components-svelte';
	import prettyBytes from 'pretty-bytes';
	import {
		DocumentBlank,
		Folder,
		Image,
		Music,
		TextFont,
		Document,
		Video,
		Book,
		DocumentPdf,
		PresentationFile,
		TableSplit,
		Archive
	} from 'carbon-icons-svelte';
	import type { File } from '$lib/types';
	import { buildPath } from '$lib/files';

	export let boxId: string;
	export let path: string[];
	export let files: File[];
	let innerWidth: number;

	let rows = files.map((file, i) => {
		return {
			id: file.id,
			name: file.name,
			path: file.path,
			type: file.mime,
			size: file.mime?.type == 'dir' ? '' : prettyBytes(file.size || 0),
			actions: i % 2 ? 'Round robin' : 'DNS delegation'
		};
	});
	let pageSize = 50;
	let page = 1;
	let filteredRowIds: any[] = [];
	let filterValue = '';

	$: console.log('filteredRowIds', filteredRowIds);

	function generateBreadcrumbPaths() {
		let currentPath: string[] = [];
		let breadcrumbs = [
			{
				name: boxId,
				path: buildPath(boxId, currentPath)
			}
		];

		for (let i = 0; i < path.length; i++) {
			const file = path[i];
			breadcrumbs.push({
				name: file,
				path: buildPath(boxId, currentPath, file)
			});
			currentPath.push(file);
		}

		return breadcrumbs;
	}
</script>

<svelte:window bind:innerWidth />

<div class="breadcrumb">
	<Breadcrumb>
		{#each generateBreadcrumbPaths() as item, index}
			<li
				class={`bx--breadcrumb-item ${
					index == generateBreadcrumbPaths().length - 1 ? 'bx--breadcrumb-item--current' : ''
				}`}
			>
				<a href={item.path} class="bx--link" data-sveltekit-reload>
					{item.name}
				</a>
			</li>
		{/each}
	</Breadcrumb>
</div>

<DataTable
	sortable
	headers={innerWidth < 500
		? [
				{ key: 'name', value: 'Name' },
				{ key: 'actions', value: 'Actions' }
		  ]
		: [
				{ key: 'name', value: 'Name' },
				{ key: 'type', value: 'Type' },
				{ key: 'size', value: 'Size' },
				{ key: 'actions', value: 'Actions' }
		  ]}
	{rows}
	{pageSize}
	{page}
>
	<Toolbar>
		<ToolbarContent>
			<ToolbarSearch persistent bind:value={filterValue} shouldFilterRows bind:filteredRowIds />
		</ToolbarContent>
	</Toolbar>

	<svelte:fragment slot="cell" let:row let:cell>
		{#if cell.key === 'name'}
			<a
				href={buildPath(boxId, path, row.name)}
				class="bx--link"
				target={row.type.type == 'dir' ? '_self' : '_blank'}
				data-sveltekit-reload
			>
				{#if row.type.type == 'application'}
					<DocumentBlank /> {cell.value}
				{:else if row.type.type == 'audio'}
					<Music /> {cell.value}
				{:else if row.type.type == 'font'}
					<TextFont /> {cell.value}
				{:else if row.type.type == 'image'}
					<Image /> {cell.value}
				{:else if row.type.type == 'text'}
					<Document /> {cell.value}
				{:else if row.type.type == 'video'}
					<Video />{cell.value}
				{:else if row.type.type == 'epub'}
					<Book />{cell.value}
				{:else if row.type.type == 'pdf'}
					<DocumentPdf />{cell.value}
				{:else if row.type.type == 'powerpoint'}
					<PresentationFile />{cell.value}
				{:else if row.type.type == 'excel'}
					<TableSplit />{cell.value}
				{:else if row.type.type == 'word'}
					<Document />{cell.value}
				{:else if row.type.type == 'archive'}
					<Archive />{cell.value}
				{:else if row.type.type == 'dir'}
					<Folder />{cell.value}
				{:else}
					<DocumentBlank /> {cell.value}
				{/if}
			</a>
		{:else if cell.key === 'type'}
			{row.type.name}
		{:else}
			{cell.value}
		{/if}
	</svelte:fragment>
</DataTable>

<Pagination bind:pageSize bind:page totalItems={filteredRowIds.length} pageSizeInputDisabled />

<style>
	.breadcrumb {
		margin-bottom: 10px;
	}
</style>
