<script lang="ts">
	import {
		DataTable,
		Toolbar,
		ToolbarContent,
		ToolbarSearch,
		Pagination,
		Link,
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

	export let path: string;
	export let files: { id: string; path: string; name: string; type: string; size: number }[];

	let rows = files.map((file, i) => {
		return {
			id: file.id,
			name: file.name,
			path: '/box' + file.path,
			type: file.type,
			size: file.type == 'dir' ? '' : prettyBytes(file.size),
			actions: i % 2 ? 'Round robin' : 'DNS delegation'
		};
	});
	let pageSize = 50;
	let page = 1;
	let filteredRowIds: any[] = [];
	let filterValue = '';

	$: console.log('filteredRowIds', filteredRowIds);

	function generateBreadcrumbPaths() {
		let pathItems = path.replace('/box/', '').split('/');
		const breadcrumbs = [];

		let currentPath = '/box';
		for (let i = 0; i < pathItems.length; i++) {
			const e = pathItems[i];
			currentPath = currentPath + '/' + e;
			breadcrumbs.push({
				name: e,
				path: currentPath
			});
		}

		return breadcrumbs;
	}
</script>

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
	headers={[
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
			<a href={row.path} class="bx--link" data-sveltekit-reload>
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
